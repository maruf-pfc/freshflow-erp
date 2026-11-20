from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import UserRole
from apps.crm.models import Restaurant, RestaurantTier
from apps.inventory.models import ItemCategory, BatchStatus, PerishableItem, StockBatch
from .models import Order, OrderStatus
from .services import InsufficientStockError, OrderAllocationService

User = get_user_model()


class OrderAllocationModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Client user & restaurant
        self.client_user = User.objects.create_user(
            username="bistro_chef_test",
            email="bistro@restaurant.com",
            password="StrongPassword123!",
            role=UserRole.RESTAURANT_CLIENT,
        )
        self.restaurant = Restaurant.objects.create(
            business_name="Green Garden Bistro",
            trade_license_no="TL-DHK-55441",
            user=self.client_user,
            tier=RestaurantTier.GOLD,  # 7% discount
        )

        # Sales agent
        self.sales_user = User.objects.create_user(
            username="sales_agent_test",
            email="sales@freshflow.io",
            password="StrongPassword123!",
            role=UserRole.SALES_AGENT,
        )

        # Item
        self.item = PerishableItem.objects.create(
            name="Fresh Dairy Milk",
            category=ItemCategory.DAIRY,
            required_temp_celsius=Decimal("2.00"),
            temp_tolerance_celsius=Decimal("1.00"),
            standard_shelf_life_days=7,
            unit_of_measure="liter",
        )

        # Batch 1 (Expiring soonest: in 2 days, 20 liters)
        self.batch_near = StockBatch.objects.create(
            batch_number="MLK-EXP-NEAR",
            item=self.item,
            harvest_pack_date=date.today() - timedelta(days=5),
            expiry_date=date.today() + timedelta(days=2),
            initial_quantity=Decimal("20.00"),
            current_quantity=Decimal("20.00"),
            purchase_cost=Decimal("60.00"),
            base_selling_price=Decimal("90.00"),
            status=BatchStatus.AVAILABLE,
            storage_bin="CHILLER-B1",
        )

        # Batch 2 (Expiring later: in 5 days, 50 liters)
        self.batch_far = StockBatch.objects.create(
            batch_number="MLK-EXP-FAR",
            item=self.item,
            harvest_pack_date=date.today() - timedelta(days=2),
            expiry_date=date.today() + timedelta(days=5),
            initial_quantity=Decimal("50.00"),
            current_quantity=Decimal("50.00"),
            purchase_cost=Decimal("60.00"),
            base_selling_price=Decimal("90.00"),
            status=BatchStatus.AVAILABLE,
            storage_bin="CHILLER-B2",
        )

    def test_strict_fefo_allocation_priority(self):
        """Ordering 25 liters must take all 20 liters of batch_near first, then 5 from batch_far."""
        order = OrderAllocationService.create_order_with_fefo_allocation(
            restaurant=self.restaurant,
            items_payload=[{"item_id": self.item.id, "quantity": Decimal("25.00")}],
        )

        self.assertEqual(order.status, OrderStatus.ALLOCATED)
        self.assertEqual(order.items.count(), 2)

        # Reload batches from db
        self.batch_near.refresh_from_db()
        self.batch_far.refresh_from_db()

        # Batch near should be depleted
        self.assertEqual(self.batch_near.current_quantity, Decimal("0.00"))
        self.assertEqual(self.batch_near.status, BatchStatus.DEPLETED)

        # Batch far should have 45 remaining
        self.assertEqual(self.batch_far.current_quantity, Decimal("45.00"))
        self.assertEqual(self.batch_far.status, BatchStatus.AVAILABLE)

        # Subtotal: 25 * 90 = 2250.00
        # Gold tier (7%): discount = 2250 * 0.07 = 157.50
        # Total: 2250 - 157.50 = 2092.50
        self.assertEqual(order.subtotal_amount, Decimal("2250.00"))
        self.assertEqual(order.discount_amount, Decimal("157.50"))
        self.assertEqual(order.total_amount, Decimal("2092.50"))

    def test_insufficient_stock_error(self):
        """Requesting more than total inventory (70 available) must raise InsufficientStockError."""
        with self.assertRaises(InsufficientStockError):
            OrderAllocationService.create_order_with_fefo_allocation(
                restaurant=self.restaurant,
                items_payload=[{"item_id": self.item.id, "quantity": Decimal("100.00")}],
            )

    def test_api_order_create_and_permissions(self):
        self.client.force_authenticate(user=self.client_user)
        res = self.client.post(
            "/api/orders/",
            {
                "items": [{"item_id": self.item.id, "quantity": "10.00"}],
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("order_number", res.data)
        self.assertEqual(res.data["restaurant_name"], "Green Garden Bistro")

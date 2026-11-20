from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import UserRole
from .models import ItemCategory, BatchStatus, PerishableItem, StockBatch

User = get_user_model()


class InventoryModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.warehouse_user = User.objects.create_user(
            username="wh_tester",
            email="wh@freshflow.io",
            password="StrongPassword123!",
            role=UserRole.WAREHOUSE_MANAGER,
        )
        self.client_user = User.objects.create_user(
            username="client_tester",
            email="client@freshflow.io",
            password="StrongPassword123!",
            role=UserRole.RESTAURANT_CLIENT,
        )

        # Perishable Item
        self.item = PerishableItem.objects.create(
            name="Organic Chicken Breast",
            category=ItemCategory.MEAT_POULTRY,
            required_temp_celsius=Decimal("-18.00"),
            temp_tolerance_celsius=Decimal("1.50"),
            standard_shelf_life_days=30,
            unit_of_measure="kg",
        )

        # Batch
        self.batch = StockBatch.objects.create(
            batch_number="TEST-CB-001",
            item=self.item,
            harvest_pack_date=date.today() - timedelta(days=5),
            expiry_date=date.today() + timedelta(days=10),
            initial_quantity=Decimal("100.00"),
            current_quantity=Decimal("100.00"),
            purchase_cost=Decimal("300.00"),
            base_selling_price=Decimal("450.00"),
            status=BatchStatus.AVAILABLE,
            storage_bin="FREEZER-A1",
        )

    def test_perishable_item_creation(self):
        self.assertEqual(str(self.item), "Organic Chicken Breast (MEAT_POULTRY)")
        self.assertEqual(self.item.required_temp_celsius, Decimal("-18.00"))

    def test_batch_properties_and_flash_sale_pricing(self):
        # 10 days remaining
        self.assertEqual(self.batch.remaining_days, 10)
        # Full price when available
        self.assertEqual(self.batch.effective_price, Decimal("450.00"))

        # Transition to FLASH_SALE: 30% markdown
        self.batch.status = BatchStatus.FLASH_SALE
        self.batch.save()
        expected_flash_price = (Decimal("450.00") * Decimal("0.70")).quantize(Decimal("0.01"))
        self.assertEqual(self.batch.effective_price, expected_flash_price)

    def test_api_staff_permissions_for_inventory(self):
        # Warehouse manager can create item
        self.client.force_authenticate(user=self.warehouse_user)
        res = self.client.post(
            "/api/inventory/items/",
            {
                "name": "Fresh Atlantic Salmon",
                "category": ItemCategory.SEAFOOD,
                "required_temp_celsius": "-2.00",
                "temp_tolerance_celsius": "0.50",
                "standard_shelf_life_days": 14,
                "unit_of_measure": "kg",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Restaurant client cannot create item (read-only)
        self.client.force_authenticate(user=self.client_user)
        fail_res = self.client.post(
            "/api/inventory/items/",
            {
                "name": "Unauthorized Beef",
                "category": ItemCategory.MEAT_POULTRY,
                "required_temp_celsius": "-18.00",
                "temp_tolerance_celsius": "1.00",
                "standard_shelf_life_days": 20,
                "unit_of_measure": "kg",
            },
            format="json",
        )
        self.assertEqual(fail_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_api_list_batches(self):
        self.client.force_authenticate(user=self.client_user)
        res = self.client.get("/api/inventory/batches/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        batches = res.json()
        raw_list = batches.get("results", batches) if isinstance(batches, dict) else batches
        self.assertGreaterEqual(len(raw_list), 1)

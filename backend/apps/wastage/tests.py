from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import UserRole
from apps.inventory.models import ItemCategory, BatchStatus, PerishableItem, StockBatch
from .models import WastageLog, WastageReason

User = get_user_model()


class WastageModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.warehouse_user = User.objects.create_user(
            username="wh_loss_officer",
            email="wh@freshflow.io",
            password="StrongPassword123!",
            role=UserRole.WAREHOUSE_MANAGER,
        )

        self.item = PerishableItem.objects.create(
            name="Ripe Tomatoes",
            category=ItemCategory.PRODUCE,
            required_temp_celsius=Decimal("12.00"),
            temp_tolerance_celsius=Decimal("2.00"),
            standard_shelf_life_days=5,
            unit_of_measure="kg",
        )

        self.batch = StockBatch.objects.create(
            batch_number="TOM-WASTE-01",
            item=self.item,
            harvest_pack_date=date.today() - timedelta(days=6),
            expiry_date=date.today() - timedelta(days=1),
            initial_quantity=Decimal("50.00"),
            current_quantity=Decimal("50.00"),
            purchase_cost=Decimal("40.00"),
            base_selling_price=Decimal("60.00"),
            status=BatchStatus.EXPIRED,
            storage_bin="AMBIENT-C1",
        )

    def test_wastage_log_creation(self):
        log = WastageLog.objects.create(
            batch=self.batch,
            quantity_lost=Decimal("50.00"),
            financial_loss=Decimal("2000.00"),  # 50 * 40 purchase cost
            reason=WastageReason.EXPIRED,
            logged_by=self.warehouse_user,
        )
        self.assertEqual(log.quantity_lost, Decimal("50.00"))
        self.assertEqual(log.financial_loss, Decimal("2000.00"))

    def test_api_wastage_log_access(self):
        self.client.force_authenticate(user=self.warehouse_user)
        res = self.client.post(
            "/api/wastage/logs/",
            {
                "batch": self.batch.id,
                "quantity_lost": "50.00",
                "financial_loss": "2000.00",
                "reason": WastageReason.EXPIRED,
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import UserRole
from apps.inventory.models import ItemCategory, BatchStatus, PerishableItem, StockBatch


User = get_user_model()


class AnalyticsKPIModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = User.objects.create_user(
            username="analytics_admin",
            email="admin@freshflow.io",
            password="StrongPassword123!",
            role=UserRole.ADMIN,
        )

        self.item = PerishableItem.objects.create(
            name="Chilled Chicken Wings",
            category=ItemCategory.MEAT_POULTRY,
            required_temp_celsius=Decimal("-18.00"),
            temp_tolerance_celsius=Decimal("1.00"),
            standard_shelf_life_days=20,
            unit_of_measure="kg",
        )

        # Batch 1: Available & Near Expiry (1 day)
        StockBatch.objects.create(
            batch_number="ANALYTICS-NEAR",
            item=self.item,
            harvest_pack_date=date.today() - timedelta(days=10),
            expiry_date=date.today() + timedelta(days=1),
            initial_quantity=Decimal("10.00"),
            current_quantity=Decimal("10.00"),
            purchase_cost=Decimal("100.00"),
            base_selling_price=Decimal("150.00"),
            status=BatchStatus.AVAILABLE,
            storage_bin="FREEZER-A1",
        )

        # Batch 2: Available & Safe Expiry (10 days)
        StockBatch.objects.create(
            batch_number="ANALYTICS-SAFE",
            item=self.item,
            harvest_pack_date=date.today() - timedelta(days=2),
            expiry_date=date.today() + timedelta(days=10),
            initial_quantity=Decimal("40.00"),
            current_quantity=Decimal("40.00"),
            purchase_cost=Decimal("100.00"),
            base_selling_price=Decimal("150.00"),
            status=BatchStatus.AVAILABLE,
            storage_bin="FREEZER-A2",
        )

    def test_kpi_metrics_endpoint(self):
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get("/api/analytics/kpis/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data
        self.assertIn("active_cold_batches", data)
        self.assertIn("near_expiry_items", data)
        self.assertIn("total_revenue", data)
        self.assertIn("spoilage_loss", data)

        # Both batches are available with quantity > 0
        self.assertEqual(data["active_cold_batches"], 2)
        # Exactly 1 batch is <= 2 days from expiry
        self.assertEqual(data["near_expiry_items"], 1)

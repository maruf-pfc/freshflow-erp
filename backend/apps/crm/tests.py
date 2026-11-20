from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import UserRole
from .models import Restaurant, RestaurantTier, TIER_DISCOUNT_RATES

User = get_user_model()


class CRMModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.sales_user = User.objects.create_user(
            username="sales_rep",
            email="sales@freshflow.io",
            password="StrongPassword123!",
            role=UserRole.SALES_AGENT,
        )

        self.client_user = User.objects.create_user(
            username="pizza_owner",
            email="owner@pizzahut.com",
            password="StrongPassword123!",
            role=UserRole.RESTAURANT_CLIENT,
        )

        self.restaurant = Restaurant.objects.create(
            business_name="Pizza Hut Gulshan",
            trade_license_no="TL-DHK-99412",
            user=self.client_user,
            tier=RestaurantTier.GOLD,
            credit_limit=Decimal("15000.00"),
        )

    def test_tier_discount_rates(self):
        self.assertEqual(TIER_DISCOUNT_RATES[RestaurantTier.BRONZE], Decimal("0.00"))
        self.assertEqual(TIER_DISCOUNT_RATES[RestaurantTier.SILVER], Decimal("0.03"))
        self.assertEqual(TIER_DISCOUNT_RATES[RestaurantTier.GOLD], Decimal("0.07"))
        self.assertEqual(TIER_DISCOUNT_RATES[RestaurantTier.PLATINUM], Decimal("0.10"))

        # Gold tier has 7% discount
        self.assertEqual(self.restaurant.tier_discount_percentage, Decimal("7.00"))
        base_price = Decimal("1000.00")
        discounted = self.restaurant.compute_discounted_price(base_price)
        self.assertEqual(discounted, Decimal("930.00"))

    def test_sales_agent_can_manage_restaurants(self):
        self.client.force_authenticate(user=self.sales_user)
        res = self.client.get("/api/crm/restaurants/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_non_sales_agent_forbidden(self):
        self.client.force_authenticate(user=self.client_user)
        res = self.client.get("/api/crm/restaurants/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

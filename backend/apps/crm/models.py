from decimal import Decimal
from django.conf import settings
from django.db import models


class RestaurantTier(models.TextChoices):
    BRONZE = "BRONZE", "Bronze (0% Discount)"
    SILVER = "SILVER", "Silver (3% Discount)"
    GOLD = "GOLD", "Gold (7% Discount)"
    PLATINUM = "PLATINUM", "Platinum (10% Discount)"


TIER_DISCOUNT_RATES = {
    RestaurantTier.BRONZE: Decimal("0.00"),
    RestaurantTier.SILVER: Decimal("0.03"),
    RestaurantTier.GOLD: Decimal("0.07"),
    RestaurantTier.PLATINUM: Decimal("0.10"),
}


class Restaurant(models.Model):
    business_name = models.CharField(max_length=200, db_index=True)
    trade_license_no = models.CharField(max_length=100, unique=True, db_index=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="restaurant",
    )
    tier = models.CharField(
        max_length=20,
        choices=RestaurantTier.choices,
        default=RestaurantTier.BRONZE,
        db_index=True,
    )
    total_spent_last_3_months = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("5000.00"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    @property
    def tier_discount_percentage(self) -> Decimal:
        return (TIER_DISCOUNT_RATES.get(self.tier, Decimal("0.00")) * Decimal("100")).quantize(Decimal("0.01"))

    def compute_discounted_price(self, base_price: Decimal) -> Decimal:
        rate = TIER_DISCOUNT_RATES.get(self.tier, Decimal("0.00"))
        discounted = base_price * (Decimal("1.00") - rate)
        return discounted.quantize(Decimal("0.01"))

    def __str__(self):
        return f"{self.business_name} [{self.tier}]"

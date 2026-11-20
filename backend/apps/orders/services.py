from decimal import Decimal
from typing import List, Dict, Any
from django.db import transaction
from apps.crm.models import Restaurant, TIER_DISCOUNT_RATES
from apps.inventory.models import PerishableItem, StockBatch, BatchStatus
from .models import Order, OrderItem, OrderStatus


class InsufficientStockError(Exception):
    """Raised when available stock batches cannot satisfy the requested quantity."""
    pass


class OrderAllocationService:
    """
    Algorithmic First-Expired, First-Out (FEFO) order allocation service.
    Guarantees atomic batch reservation, strict expiry_date ASC priority,
    server-side tier discount calculation, and concurrency safety via select_for_update().
    """

    @classmethod
    @transaction.atomic
    def create_order_with_fefo_allocation(
        cls,
        restaurant: Restaurant,
        items_payload: List[Dict[str, Any]],
    ) -> Order:
        """
        items_payload format:
        [
            {"item_id": 1, "quantity": Decimal("25.00")},
            ...
        ]
        """
        if not items_payload:
            raise ValueError("Order must contain at least one perishable item line.")

        # Initialize the Order
        order = Order.objects.create(
            restaurant=restaurant,
            status=OrderStatus.PENDING,
        )

        subtotal = Decimal("0.00")

        for line in items_payload:
            item_id = line["item_id"]
            requested_qty = Decimal(str(line["quantity"]))

            if requested_qty <= Decimal("0.00"):
                raise ValueError(f"Quantity for item_id {item_id} must be strictly positive (> 0).")

            try:
                # Lock the perishable item row to serialize concurrent FEFO allocations
                perishable_item = PerishableItem.objects.select_for_update().get(id=item_id)
            except PerishableItem.DoesNotExist:
                raise ValueError(f"PerishableItem with id {item_id} does not exist.")

            # Concurrency-safe FEFO query with row-level locks
            available_batches = (
                StockBatch.objects.select_for_update()
                .filter(
                    item=perishable_item,
                    status__in=[BatchStatus.AVAILABLE, BatchStatus.FLASH_SALE],
                    current_quantity__gt=Decimal("0.00"),
                )
                .order_by("expiry_date", "id")
            )

            total_available = sum((b.current_quantity for b in available_batches), Decimal("0.00"))
            if total_available < requested_qty:
                raise InsufficientStockError(
                    f"Insufficient stock for '{perishable_item.name}'. "
                    f"Requested: {requested_qty}, Available: {total_available}"
                )

            remaining_to_allocate = requested_qty

            for batch in available_batches:
                if remaining_to_allocate <= Decimal("0.00"):
                    break

                allocation_qty = min(batch.current_quantity, remaining_to_allocate)
                batch.current_quantity -= allocation_qty

                if batch.current_quantity == Decimal("0.00"):
                    batch.status = BatchStatus.DEPLETED

                batch.save(update_fields=["current_quantity", "status", "updated_at"])

                # Unit price is batch's effective_price (incorporating 30% flash sale markdown if applicable)
                unit_price = batch.effective_price
                line_subtotal = (allocation_qty * unit_price).quantize(Decimal("0.01"))
                subtotal += line_subtotal

                OrderItem.objects.create(
                    order=order,
                    item=perishable_item,
                    batch=batch,
                    quantity_ordered=allocation_qty,
                    unit_price=unit_price,
                    subtotal=line_subtotal,
                )

                remaining_to_allocate -= allocation_qty

        # Server-side Tier Dynamic Pricing calculation
        discount_rate = TIER_DISCOUNT_RATES.get(restaurant.tier, Decimal("0.00"))
        discount_amount = (subtotal * discount_rate).quantize(Decimal("0.01"))
        total_amount = (subtotal - discount_amount).quantize(Decimal("0.01"))

        order.subtotal_amount = subtotal
        order.tier_discount_percent = (discount_rate * Decimal("100")).quantize(Decimal("0.01"))
        order.discount_amount = discount_amount
        order.total_amount = total_amount
        order.status = OrderStatus.ALLOCATED
        order.save()

        # Update restaurant 3-month running spend
        restaurant.total_spent_last_3_months += total_amount
        restaurant.save(update_fields=["total_spent_last_3_months", "updated_at"])

        return order

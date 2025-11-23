# Pricing Business Logic Reference Implementation
# This Python code defines the exact business rules for pricing
# The LLM will translate this to your target language (JavaScript, TypeScript, Rust, etc.)

def calculate_total(items, user, tax_rate=None):
    """
    Calculate order total with all business rules applied.
    
    Args:
        items: List of dicts with {price: float, quantity: int}
        user: Dict with {loyaltyTier: str, state: str}
        tax_rate: Optional tax rate override
    
    Returns:
        Dict with subtotal, discount, tax, and total
    """
    # Calculate subtotal
    subtotal = sum(item['price'] * item['quantity'] for item in items)
    
    # Apply volume discount (10+ items = 10% off)
    volume_discount = 0
    total_items = sum(item['quantity'] for item in items)
    if total_items >= 10:
        volume_discount = subtotal * 0.10
    
    # Apply loyalty tier discount
    tier_discounts = {
        'bronze': 0.05,  # 5%
        'silver': 0.10,  # 10%
        'gold': 0.15     # 15%
    }
    loyalty_discount = subtotal * tier_discounts.get(user['loyaltyTier'], 0)
    
    # Total discount
    total_discount = volume_discount + loyalty_discount
    
    # Calculate tax
    if tax_rate is None:
        # State-specific tax rates
        tax_rate = 0.08 if user['state'] == 'CA' else 0.05
    
    taxable_amount = subtotal - total_discount
    tax = taxable_amount * tax_rate
    
    # Final total
    total = subtotal - total_discount + tax
    
    return {
        'subtotal': round(subtotal, 2),
        'discount': round(total_discount, 2),
        'tax': round(tax, 2),
        'total': round(total, 2)
    }


def apply_discount(amount, discount_percent):
    """
    Apply percentage discount to amount.
    
    Args:
        amount: Original amount
        discount_percent: Discount as percentage (e.g. 10 for 10%)
    
    Returns:
        Discounted amount rounded to 2 decimals
    """
    discount = amount * (discount_percent / 100)
    return round(amount - discount, 2)


def validate_order(order_total, minimum=10.00):
    """
    Validate order meets minimum requirement.
    
    Args:
        order_total: Total order amount
        minimum: Minimum order amount (default $10)
    
    Returns:
        True if valid, False otherwise
    """
    return order_total >= minimum

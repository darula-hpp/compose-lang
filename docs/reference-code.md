# Reference Code Guide

## What is the reference/ Directory?

The `reference/` directory contains implementation code in any language that serves as a blueprint for the LLM. The LLM reads this code and translates it to your target language, preserving the exact business logic.

## When to Use Reference Code

Use reference code when you have:
- **Complex business logic** that's hard to describe in English
- **Mathematical algorithms** that need precision
- **Existing code** you want to preserve across platforms
- **Database queries** with specific optimization patterns
- **Validation rules** with many edge cases

## How It Works

### 1. Write Reference Implementation

In `reference/`, create files with your business logic in any language:

```python
# reference/pricing.py

def calculate_loyalty_discount(amount, years_member):
    """
    Calculate loyalty discount based on membership duration.
    Business rules approved by CEO on 2024-01-15.
    """
    if years_member >= 5:
        return amount * 0.15  # 15% for 5+ years
    elif years_member >= 3:
        return amount * 0.10  # 10% for 3-4 years
    elif years_member >= 1:
        return amount * 0.05  # 5% for 1-2 years
    else:
        return 0  # No discount for new members
```

### 2. Reference in .compose File

Use `@reference/filename` in your guides:

```compose
guide "Loyalty Discount Calculation":
  - Reference: @reference/pricing.py::calculate_loyalty_discount
  - Translate this function to target language
  - Preserve exact percentage thresholds
  - Round to 2 decimal places
```

### 3. LLM Translates to Target

**For TypeScript:**
```typescript
function calculateLoyaltyDiscount(amount: number, yearsMember: number): number {
  if (yearsMember >= 5) {
    return amount * 0.15;
  } else if (yearsMember >= 3) {
    return amount * 0.10;
  } else if (yearsMember >= 1) {
    return amount * 0.05;
  } else {
    return 0;
  }
}
```

**For Rust:**
```rust
fn calculate_loyalty_discount(amount: f64, years_member: u32) -> f64 {
    if years_member >= 5 {
        amount * 0.15
    } else if years_member >= 3 {
        amount * 0.10
    } else if years_member >= 1 {
        amount * 0.05
    } else {
        0.0
    }
}
```

## Best Practices

### Use Python for Business Logic
```python
# Easy to read, validate, and share with non-technical stakeholders
def calculate_tax(amount, region):
    tax_rates = {
        'CA': 0.0725,
        'NY': 0.08875,
        'TX': 0.0625
    }
    return amount * tax_rates.get(region, 0.05)
```

### Use SQL for Complex Queries
```sql
-- reference/reports.sql
-- Monthly revenue report with customer segmentation
SELECT 
  DATE_TRUNC('month', order_date) as month,
  customer_tier,
  COUNT(DISTINCT customer_id) as unique_customers,
  SUM(total) as revenue
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY month, customer_tier
ORDER BY month DESC, revenue DESC;
```

### Use JavaScript for Algorithms
```javascript
// reference/validation.js
// Email validation with specific corp rules
function isValidCorporateEmail(email) {
  // Must be company domain
  const validDomains = ['company.com', 'subsidiary.com'];
  const domain = email.split('@')[1];
  
  if (!validDomains.includes(domain)) {
    return false;
  }
  
  // No plus addressing allowed
  if (email.includes('+')) {
    return false;
  }
  
  return /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/.test(email);
}
```

## Ownership

Reference code can be owned by different teams:

```
reference/
├── pricing/          # Product team owns
│   ├── discounts.py
│   └── promotions.py
├── validation/       # Security team owns
│   └── rules.js
├── analytics/        # Data team owns
│   └── queries.sql
└── integrations/     # Engineering team owns
    └── third_party.py
```

## Version Control

Reference code is version controlled like any code:

```bash
git log reference/pricing.py

commit abc123
Author: Product Manager <pm@company.com>
Date: 2024-01-15

  Update loyalty thresholds per CEO approval
  - 5+ years: 10% → 15%
  - 3-4 years: 8% → 10%
```

## Framework-Agnostic

The same reference code works for all targets:

```compose
# Same pricing.py referenced
compose build --target react      # → TypeScript
compose build --target vue        # → JavaScript  
compose build --target flutter    # → Dart
compose build --target ios        # → Swift
```

## Testing Reference Code

Test your reference implementations independently:

```python
# reference/pricing.py
def calculate_discount(amount, tier):
    # implementation...

# tests/test_pricing.py
def test_gold_tier_discount():
    assert calculate_discount(100, 'gold') == 15
    
def test_silver_tier_discount():
    assert calculate_discount(100, 'silver') == 10
```

Once tests pass, you know the logic is correct for ALL target platforms.

## Examples

See complete examples in:
- `examples/ecommerce-with-reference/` - Shows @ operator usage
- `examples/payment-system-evolution.md` - Shows how guides grow over time

## Summary

**Reference code is NOT imported** - it's a translation source.
**Write once in Python** → **Generate for any language**
**Business logic stays consistent** across all platforms.

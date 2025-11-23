# Payment System Evolution Example

This document shows how a `.compose` file evolves as developers discover bugs and edge cases during development.

---

## Day 1: Initial Product Requirement

**Committed by:** Product Manager  
**Message:** "Initial payment feature spec"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email
```

**Developer builds this → Gets basic payment flow working**

---

## Week 1, Day 3: First Bug (Amount Handling)

**Issue:** User paid $10.50, but system charged $1050 (cents conversion bug)

**Committed by:** Backend Developer  
**Message:** "Fix: Add guide for currency handling"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email

guide "Currency Handling":
  - Store amounts in cents (integer) to avoid floating point errors
  - Convert from dollars to cents: amount * 100
  - Display to users with proper decimal formatting
  - Validate amount is positive and less than $1,000,000
```

**Rebuild → Currency handling now correct**

---

## Week 1, Day 5: Race Condition Discovered

**Issue:** User double-clicked "Pay" button, got charged twice

**Committed by:** Backend Developer  
**Message:** "Fix: Add idempotency guide"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number
  idempotencyKey: text (unique)  # Added field

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email

guide "Currency Handling":
  - Store amounts in cents (integer) to avoid floating point errors
  - Convert from dollars to cents: amount * 100
  - Display to users with proper decimal formatting
  - Validate amount is positive and less than $1,000,000

guide "Idempotency":
  - Generate unique idempotency key on frontend (UUID v4)
  - Check if payment with same idempotencyKey exists
  - If exists and completed, return existing payment
  - If exists and pending, wait and retry
  - Use database unique constraint on idempotencyKey
  - Disable submit button after first click (UX)
```

**Rebuild → No more double charges**

---

## Week 2, Day 1: Stripe Webhook Failures

**Issue:** Webhook sometimes fails, payment stuck in "pending"

**Committed by:** Backend Developer  
**Message:** "Fix: Add webhook retry logic"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number
  idempotencyKey: text (unique)
  webhookAttempts: number  # Added field

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email

guide "Currency Handling":
  - Store amounts in cents (integer) to avoid floating point errors
  - Convert from dollars to cents: amount * 100
  - Display to users with proper decimal formatting
  - Validate amount is positive and less than $1,000,000

guide "Idempotency":
  - Generate unique idempotency key on frontend (UUID v4)
  - Check if payment with same idempotencyKey exists
  - If exists and completed, return existing payment
  - If exists and pending, wait and retry
  - Use database unique constraint on idempotencyKey
  - Disable submit button after first click (UX)

guide "Webhook Handling":
  - Verify Stripe webhook signature before processing
  - Use exponential backoff for retries (1s, 2s, 4s, 8s, 16s)
  - Maximum 5 retry attempts
  - Store webhook payload in database for debugging
  - Mark payment as failed after 5 failed attempts
  - Send alert to ops team on retry failure
  - Implement manual reconciliation endpoint for stuck payments
```

**Rebuild → Webhooks now resilient**

---

## Week 2, Day 4: Security Audit Findings

**Issue:** QA team found payments can be created with negative amounts

**Committed by:** Security Engineer  
**Message:** "Security: Add validation and logging"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number
  idempotencyKey: text (unique)
  webhookAttempts: number
  ipAddress: text       # Added field
  userAgent: text       # Added field
  createdAt: timestamp  # Added field

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email

guide "Currency Handling":
  - Store amounts in cents (integer) to avoid floating point errors
  - Convert from dollars to cents: amount * 100
  - Display to users with proper decimal formatting
  - Validate amount is positive and less than $1,000,000

guide "Idempotency":
  - Generate unique idempotency key on frontend (UUID v4)
  - Check if payment with same idempotencyKey exists
  - If exists and completed, return existing payment
  - If exists and pending, wait and retry
  - Use database unique constraint on idempotencyKey
  - Disable submit button after first click (UX)

guide "Webhook Handling":
  - Verify Stripe webhook signature before processing
  - Use exponential backoff for retries (1s, 2s, 4s, 8s, 16s)
  - Maximum 5 retry attempts
  - Store webhook payload in database for debugging
  - Mark payment as failed after 5 failed attempts
  - Send alert to ops team on retry failure
  - Implement manual reconciliation endpoint for stuck payments

guide "Security & Validation":
  - Validate amount > 0 and amount <= 100000000 (server-side)
  - Validate currency is in allowed list (USD, EUR, GBP only)
  - Check user has sufficient permissions
  - Log all payment attempts with IP and user agent
  - Rate limit to 10 payment attempts per user per hour
  - Block payments from known VPN/proxy IP ranges
  - Require 2FA for payments over $1000
```

**Rebuild → Security holes patched**

---

## Week 3, Day 2: Production Performance Issues

**Issue:** Payment page slow, users complaining about lag

**Committed by:** Backend Developer  
**Message:** "Performance: Add caching and optimization"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number
  idempotencyKey: text (unique)
  webhookAttempts: number
  ipAddress: text
  userAgent: text
  createdAt: timestamp

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email

guide "Currency Handling":
  - Store amounts in cents (integer) to avoid floating point errors
  - Convert from dollars to cents: amount * 100
  - Display to users with proper decimal formatting
  - Validate amount is positive and less than $1,000,000

guide "Idempotency":
  - Generate unique idempotency key on frontend (UUID v4)
  - Check if payment with same idempotencyKey exists
  - If exists and completed, return existing payment
  - If exists and pending, wait and retry
  - Use database unique constraint on idempotencyKey
  - Disable submit button after first click (UX)

guide "Webhook Handling":
  - Verify Stripe webhook signature before processing
  - Use exponential backoff for retries (1s, 2s, 4s, 8s, 16s)
  - Maximum 5 retry attempts
  - Store webhook payload in database for debugging
  - Mark payment as failed after 5 failed attempts
  - Send alert to ops team on retry failure
  - Implement manual reconciliation endpoint for stuck payments

guide "Security & Validation":
  - Validate amount > 0 and amount <= 100000000 (server-side)
  - Validate currency is in allowed list (USD, EUR, GBP only)
  - Check user has sufficient permissions
  - Log all payment attempts with IP and user agent
  - Rate limit to 10 payment attempts per user per hour
  - Block payments from known VPN/proxy IP ranges
  - Require 2FA for payments over $1000

guide "Performance":
  - Add database index on userId and createdAt
  - Cache user payment history for 5 minutes
  - Use database connection pooling (min 5, max 20)
  - Process confirmation emails asynchronously (background job)
  - Load payment form lazily (code splitting)
  - Debounce validation input (500ms)
  - Use Read Replica for payment history queries
```

**Rebuild → Page loads 3x faster**

---

## Week 4, Day 1: Email Delivery Issues

**Issue:** Confirmation emails going to spam folder

**Committed by:** DevOps Engineer  
**Message:** "Email: Add SPF/DKIM and improve templates"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number
  idempotencyKey: text (unique)
  webhookAttempts: number
  ipAddress: text
  userAgent: text
  createdAt: timestamp
  emailSentAt: timestamp?  # Added field

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email

guide "Currency Handling":
  - Store amounts in cents (integer) to avoid floating point errors
  - Convert from dollars to cents: amount * 100
  - Display to users with proper decimal formatting
  - Validate amount is positive and less than $1,000,000

guide "Idempotency":
  - Generate unique idempotency key on frontend (UUID v4)
  - Check if payment with same idempotencyKey exists
  - If exists and completed, return existing payment
  - If exists and pending, wait and retry
  - Use database unique constraint on idempotencyKey
  - Disable submit button after first click (UX)

guide "Webhook Handling":
  - Verify Stripe webhook signature before processing
  - Use exponential backoff for retries (1s, 2s, 4s, 8s, 16s)
  - Maximum 5 retry attempts
  - Store webhook payload in database for debugging
  - Mark payment as failed after 5 failed attempts
  - Send alert to ops team on retry failure
  - Implement manual reconciliation endpoint for stuck payments

guide "Security & Validation":
  - Validate amount > 0 and amount <= 100000000 (server-side)
  - Validate currency is in allowed list (USD, EUR, GBP only)
  - Check user has sufficient permissions
  - Log all payment attempts with IP and user agent
  - Rate limit to 10 payment attempts per user per hour
  - Block payments from known VPN/proxy IP ranges
  - Require 2FA for payments over $1000

guide "Performance":
  - Add database index on userId and createdAt
  - Cache user payment history for 5 minutes
  - Use database connection pooling (min 5, max 20)
  - Process confirmation emails asynchronously (background job)
  - Load payment form lazily (code splitting)
  - Debounce validation input (500ms)
  - Use Read Replica for payment history queries

guide "Email Delivery":
  - Use verified domain with SPF and DKIM records
  - Set proper Reply-To header
  - Include plain text version (not just HTML)
  - Add unsubscribe link (required by law)
  - Use descriptive subject: "Payment Confirmation - Order #12345"
  - Include payment details in email body (amount, date, receipt)
  - Retry failed emails up to 3 times (1 hour apart)
  - Track email open/click rates
  - Store emailSentAt timestamp for debugging
```

**Rebuild → Emails now landing in inbox**

---

## Month 2: International Expansion

**New Requirement:** Support multiple currencies and tax calculations

**Committed by:** Backend Developer  
**Message:** "Feature: Add multi-currency and tax support"

```compose
model Payment:
  amount: number
  currency: text
  status: "pending" | "completed" | "failed"
  userId: number
  idempotencyKey: text (unique)
  webhookAttempts: number
  ipAddress: text
  userAgent: text
  createdAt: timestamp
  emailSentAt: timestamp?
  exchangeRate: number?      # Added field
  taxAmount: number          # Added field
  taxRate: number            # Added field
  countryCode: text          # Added field

feature "Payment Processing":
  - Accept credit card payments
  - Process one-time purchases
  - Send confirmation email
  - Support multiple currencies (USD, EUR, GBP, CAD, AUD)
  - Calculate and apply local taxes

# ... All previous guides remain ...

guide "Multi-Currency":
  - Fetch exchange rates from reliable API (exchangerate-api.io)
  - Cache exchange rates for 1 hour
  - Store base currency (USD) and display currency separately
  - Always store amounts in base currency for accounting
  - Show converted amount to user before payment
  - Include exchange rate and conversion in confirmation email
  - Handle currency mismatch errors gracefully

guide "Tax Calculation":
  - Determine tax rate based on user's country and state/province
  - US: varies by state (0% to 10%)
  - EU: VAT rates (19%-27% depending on country)
  - Validate tax ID for B2B transactions (exempt from VAT)
  - Store tax amount separately for reporting
  - Include tax breakdown in receipt
  - Update tax rates monthly (fetch from tax API)
```

**Rebuild → Now supports 5 currencies with automatic tax**

---

## Summary: Evolution Over Time

**Week 1:** Started with 3 lines
```compose
feature "Payment Processing"
```

**Month 2:** Grew to 100+ lines with 9 guide blocks
```compose
model Payment (12 fields)
feature "Payment Processing" (5 items)
guide "Currency Handling"
guide "Idempotency"
guide "Webhook Handling"
guide "Security & Validation"
guide "Performance"
guide "Email Delivery"
guide "Multi-Currency"
guide "Tax Calculation"
```

**Each `guide` = A bug fixed or optimization discovered**

**The .compose file becomes the team's accumulated knowledge.**

---

## Key Takeaway

The guides section grows organically as the team:
- Fixes bugs
- Handles edge cases
- Optimizes performance
- Adds security
- Scales the system

**Instead of this knowledge living in:**
- ❌ Comments in generated code (lost on rebuild)
- ❌ Slack messages (not searchable)
- ❌ Jira tickets (disconnected from code)
- ❌ Developer brains (lost when they leave)

**It lives in the .compose file:**
- ✅ Version controlled
- ✅ Executable (rebuilds work)
- ✅ Reviewable (PR comments)
- ✅ Transferable (onboarding doc)

This is the power of guide blocks! 🎯

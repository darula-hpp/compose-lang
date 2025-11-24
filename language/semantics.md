# Compose Language Specification

> **Version 0.2.0** - Vibe Engineering Language

## Overview

Compose is a three-keyword architecture specification language designed for LLM-based code generation. It separates business logic (what) from technical implementation (how).

## Core Philosophy

**Three keywords. That's it:**
- `model` - Data structures
- `feature` - Application behavior
- `guide` - Implementation details

**No classes. No functions. No syntax complexity.**

---

## Keywords

### 1. `model` - Data Structures

Define the shape of your data:

```compose
model User:
  id: number
  email: text (unique)
  name: text
  role: "admin" | "member"
  createdAt: timestamp
```

**Supported types:**
- Primitives: `text`, `number`, `bool`, `date`, `timestamp`
- Rich types: `image`, `file`, `markdown`, `json`
- References: Other model names (e.g., `User`, `Todo`)
- Enums: `"value1" | "value2" | "value3"`
- Arrays: `list of Type` or `Type[]`
- Optional: `Type?`

**Constraints:**
- `(unique)` - Unique constraint
- `(required)` - Not nullable

---

### 2. `feature` - Application Behavior

Describe what users can do:

```compose
feature "User Authentication":
  - Email/password signup
  - Social login (Google, GitHub)
  - Password reset via email
  - Session management with JWT

feature "Dashboard":
  - Show user statistics
  - Recent activity feed
  - Quick actions panel
```

**Use for:**
- User-facing functionality
- Business workflows
- UI/UX requirements
- Integrations
- Visual design

---

### 3. `guide` - Implementation Details

Specify how features should be implemented:

```compose
guide "Authentication Security":
  - Use bcrypt with cost factor 12
  - Rate limit: 5 login attempts per 15 minutes
  - JWT tokens expire after 24 hours
  - Refresh tokens in httpOnly cookies

guide "Performance":
  - Cache user data for 5 minutes
  - Use database connection pooling (min 5, max 20)
  - Debounce search input (300ms)
```

**Use for:**
- Implementation constraints
- Performance requirements
- Security rules
- Edge case handling
- Bug fixes

**Key insight:** Guides grow as you develop. Start minimal, add details as you discover edge cases.

---

## Special Operators

### `@` - Reference External Code

Reference implementation code in any language:

```compose
guide "Pricing Calculation":
  - Reference: @reference/pricing.py::calculate_discount
  - LLM translates this to target language
  - Preserve exact business rules
```

**The LLM reads the reference file and translates the logic** to your target language (TypeScript, Rust, Go, etc.).

---

## File Organization

### `.compose` Files - Business Logic

Framework-agnostic specifications:

```
src/
├── app.compose           # Main application
├── models/
│   ├── user.compose
│   └── product.compose
└── features/
    ├── auth.compose
    └── checkout.compose
```

### `compose.json` - Technical Decisions

Framework and deployment configuration:

```json
{
  "targets": {
    "web": {
      "framework": "nextjs",
      "language": "typescript"
    }
  },
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
}
```

### `reference/` - Complex Logic

Business logic reference implementations:

```
reference/
├── pricing.py       # Pricing algorithms
├── validation.js    # Validation rules
└── queries.sql      # Database queries
```

### `assets/` - Static Files

Framework-agnostic static assets:

```
assets/
├── logo.svg
├── favicon.ico
└── images/
```

---

## Imports

Import models and definitions from other files:

```compose
import "models/user.compose"
import "features/auth.compose"

model Order:
  userId: User     # References imported User model
  total: number
```

---

## Complete Example

```compose
# ═══════════════════════════════════════
# MODELS
# ═══════════════════════════════════════

model User:
  id: number
  email: text (unique)
  role: "admin" | "member"

model Todo:
  id: number
  title: text
  completed: bool
  userId: User
  dueDate: date?

# ═══════════════════════════════════════
# FEATURES
# ═══════════════════════════════════════

feature "Todo Management":
  - Create todos with title and optional due date
  - Mark as complete/incomplete
  - Delete todos
  - Filter by status (all/active/completed)

feature "User Authentication":
  - Email/password login
  - Session persistence
  - Logout functionality

feature "Theme":
  - Clean, minimal design
  - Blue/indigo color scheme
  - Dark mode support

# ═══════════════════════════════════════
# GUIDES
# ═══════════════════════════════════════

guide "Data Validation":
  - Todo titles: 1-200 characters
  - Trim whitespace before saving
  - Due date must be today or future

guide "Performance":
  - Cache todo list for 5 minutes
  - Paginate at 50 items per page
  - Debounce filter changes (300ms)

guide "Security":
  - Hash passwords with bcrypt cost 12
  - Rate limit login: 5 attempts per 15 min
  - Store sessions in Redis (24h TTL)
```

---

## Type System

### Primitive Types

```compose
model Example:
  textField: text           # String
  numberField: number       # Integer or decimal
  boolField: bool          # Boolean
  dateField: date          # Date only
  timestampField: timestamp # Date + time
```

### Rich Types

```compose
model Article:
  content: markdown        # Markdown content
  metadata: json          # JSON object
  coverImage: image       # Image file
  attachment: file        # Generic file
```

### Enums

```compose
model User:
  status: "active" | "suspended" | "deleted"
  role: "admin" | "moderator" | "member"
```

### Arrays

```compose
model Order:
  items: list of Item      # Array notation 1
  tags: text[]            # Array notation 2
```

### Optional Fields

```compose
model User:
  bio: text?              # Optional
  avatar: image?          # Optional
```

### References

```compose
model Comment:
  authorId: User          # Reference to User model
  postId: Post           # Reference to Post model
```

---

## Grammar Rules

### Indentation

Use consistent indentation (2 or 4 spaces):

```compose
model User:
  email: text            # Indented
  name: text             # Same level

feature "Auth":
  - Login                # Indented
  - Logout               # Same level
```

### Comments

```compose
# Single-line comment
model User:
  email: text  # Inline comment
```

### String Literals

Use double quotes for strings:

```compose
feature "User Management"   # Quoted
guide "Security Rules"      # Quoted
```

---

## Best Practices

### Start Simple

```compose
# Day 1
model User
feature "Login"
```

### Add Details as You Develop

```compose
# Week 2 (after discovering bugs)
model User:
  email: text (unique)
  
feature "Login"

guide "Login Security":
  - Rate limit 5 attempts
  - Lock after 10 failures
```

### Use Reference Code for Complex Logic

```compose
# For complex calculations, write Python
guide "Pricing":
  - Reference: @reference/pricing.py
  - DO NOT import - LLM translates
```

### Separate Concerns

- **Models** = Data shape (framework-agnostic)
- **Features** = What app does (business view)
- **Guides** = How it works (developer view)
- **compose.json** = Tech stack (infrastructure)

---

## Evolution Pattern

Compose specs evolve naturally:

**Initial (Product Manager):**
```compose
feature "Payment Processing"
```

**After Development (Engineer adds guides):**
```compose
feature "Payment Processing"

guide "Payment Security":
  - Use Stripe tokenization
  - Never store card numbers
  - PCI DSS compliant

guide "Error Handling":
  - Retry failed payments 3 times
  - Send alert on repeated failures
```

**After Bug Report (Engineer refines):**
```compose
guide "Payment Security":
  - Use Stripe tokenization
  - Never store card numbers
  - PCI DSS compliant
  - CRITICAL: Verify webhook signatures

guide "Idempotency":
  - Use UUID idempotency keys
  - Check duplicate payments
  - Handle race conditions
```

**The .compose file becomes institutional knowledge.**

---

## Comparison to Traditional Languages

| Traditional | Compose |
|-------------|---------|
| Classes, methods, functions | 3 keywords |
| 1000s of lines of code | 50-100 lines of spec |
| Code = source of truth | Spec = source of truth |
| Comments often outdated | Spec generates code |
| Framework-specific | Framework-agnostic |
| Learn syntax deeply | Learn 3 keywords |

---

## Summary

**Compose is not a programming language.** It's a vibe engineering language.

You describe the vibe (what the app should do), the LLM handles the implementation.

**Three keywords:**
- `model` - Data
- `feature` - Behavior
- `guide` - Implementation

**That's it.** No complexity. Just vibes. 🎯

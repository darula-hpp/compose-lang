# Intermediate Representation (IR) Specification

> **Version 0.2.0** - Simplified IR for Three-Keyword Architecture

## Overview

The Compose compiler generates a simplified Intermediate Representation (IR) from `.compose` files. This IR is framework-agnostic and contains only the essential information needed for code generation.

## IR Schema

```javascript
{
  models: [],      // Array of ModelIR
  features: [],    // Array of FeatureIR
  guides: [],      // Array of GuideIR
  imports: []      // Array of import paths (strings)
}
```

---

## 1. Model IR

Represents data structures defined with `model` keyword.

```javascript
{
  type: 'model',
  name: string,           // Model name (e.g., "User")
  fields: FieldIR[]       // Array of fields
}
```

### Field IR

```javascript
{
  name: string,           // Field name (e.g., "email")
  type: TypeIR,           // Type information
  optional: boolean,      // Is field optional?
  constraints: string[]   // e.g., ['unique', 'required']
}
```

### Type IR

```javascript
{
  baseType: string,       // 'text', 'number', 'User', etc.
  isArray: boolean,       // true if list/array
  enumValues: string[]    // For enum types: ["admin", "member"]
}
```

### Example

**Source:**
```compose
model User:
  email: text (unique)
  role: "admin" | "member"
  posts: list of Post
```

**IR:**
```json
{
  "type": "model",
  "name": "User",
  "fields": [
    {
      "name": "email",
      "type": { "baseType": "text", "isArray": false },
      "optional": false,
      "constraints": ["unique"]
    },
    {
      "name": "role",
      "type": { 
        "baseType": "enum", 
        "isArray": false,
        "enumValues": ["admin", "member"]
      },
      "optional": false,
      "constraints": []
    },
    {
      "name": "posts",
      "type": { "baseType": "Post", "isArray": true },
      "optional": false,
      "constraints": []
    }
  ]
}
```

---

## 2. Feature IR

Represents application behavior defined with `feature` keyword.

```javascript
{
  type: 'feature',
  name: string,           // Feature name
  description: string[]   // Array of bullet points
}
```

### Example

**Source:**
```compose
feature "User Authentication":
  - Email/password signup
  - Password reset via email
  - Session management
```

**IR:**
```json
{
  "type": "feature",
  "name": "User Authentication",
  "description": [
    "Email/password signup",
    "Password reset via email",
    "Session management"
  ]
}
```

---

## 3. Guide IR

Represents implementation details defined with `guide` keyword.

```javascript
{
  type: 'guide',
  name: string,           // Guide name
  hints: string[]         // Array of implementation hints
}
```

### Example

**Source:**
```compose
guide "Authentication Security":
  - Use bcrypt with cost factor 12
  - Rate limit: 5 attempts per 15 min
  - JWT tokens expire after 24 hours
```

**IR:**
```json
{
  "type": "guide",
  "name": "Authentication Security",
  "hints": [
    "Use bcrypt with cost factor 12",
    "Rate limit: 5 attempts per 15 min",
    "JWT tokens expire after 24 hours"
  ]
}
```

---

## 4. Complete IR Example

**Source (.compose file):**
```compose
import "shared/types.compose"

model Todo:
  title: text
  completed: bool
  dueDate: date?

feature "Todo Management":
  - Create todos
  - Mark complete
  - Delete todos

guide "Performance":
  - Cache todo list for 5 minutes
  - Paginate at 50 items
```

**Generated IR:**
```json
{
  "models": [
    {
      "type": "model",
      "name": "Todo",
      "fields": [
        {
          "name": "title",
          "type": { "baseType": "text", "isArray": false },
          "optional": false,
          "constraints": []
        },
        {
          "name": "completed",
          "type": { "baseType": "bool", "isArray": false },
          "optional": false,
          "constraints": []
        },
        {
          "name": "dueDate",
          "type": { "baseType": "date", "isArray": false },
          "optional": true,
          "constraints": []
        }
      ]
    }
  ],
  "features": [
    {
      "type": "feature",
      "name": "Todo Management",
      "description": [
        "Create todos",
        "Mark complete",
        "Delete todos"
      ]
    }
  ],
  "guides": [
    {
      "type": "guide",
      "name": "Performance",
      "hints": [
        "Cache todo list for 5 minutes",
        "Paginate at 50 items"
      ]
    }
  ],
  "imports": ["shared/types.compose"]
}
```

---

## Type Mappings

### Primitive Types

| Compose Type | Description | Common Mappings |
|--------------|-------------|-----------------|
| `text` | String | `string`, `str`, `String` |
| `number` | Numeric value | `number`, `int`, `float` |
| `bool` | Boolean | `boolean`, `bool` |
| `date` | Date only | `Date`, `datetime.date` |
| `timestamp` | Date + time | `Date`, `datetime` |

### Rich Types

| Compose Type | Description | Common Mappings |
|--------------|-------------|-----------------|
| `image` | Image file | `File`, `Blob`, `Image` |
| `file` | Generic file | `File`, `Blob` |
| `markdown` | Markdown text | `string` |
| `json` | JSON object | `object`, `dict`, `Map` |

---

## Multi-File Projects

When multiple `.compose` files are imported, the compiler:

1. **Parses each file independently** → Generates separate IR
2. **Resolves imports** → Links model references
3. **Merges IR** → Creates combined IR for code generation

**Example:**

```
src/
├── models/user.compose    → IR1
├── models/post.compose    → IR2
└── app.compose            → IR3 (imports IR1, IR2)
```

**Combined IR:**
```json
{
  "models": [...IR1.models, ...IR2.models, ...IR3.models],
  "features": [...IR3.features],
  "guides": [...IR3.guides],
  "imports": ["models/user.compose", "models/post.compose"]
}
```

---

## LLM Prompt Generation

The IR is converted to a prompt for the LLM:

```
You are generating code for a [TARGET_FRAMEWORK] application.

## Data Models

User
- email: text (unique)
- role: "admin" | "member"

Todo
- title: text
- completed: boolean
- userId: User reference

## Features

User Authentication:
- Email/password signup
- Password reset via email
- Session management

Todo Management:
- Create todos
- Mark complete
- Delete todos

## Implementation Guides

Authentication Security:
- Use bcrypt with cost factor 12
- Rate limit: 5 attempts per 15 min
- JWT tokens expire after 24 hours

Performance:
- Cache todo list for 5 minutes
- Paginate at 50 items

Generate production-ready [LANGUAGE] code that implements this specification.
```

---

## Reference Code Integration

When `@reference/file.ext` is used in guides:

1. **Parse guide text** → Extract `@reference/...` paths
2. **Read reference files** → Load content
3. **Include in LLM prompt** → Add to context

**Example:**

```compose
guide "Pricing Logic":
  - Reference: @reference/pricing.py::calculate_discount
  - Translate to target language
```

**LLM receives:**
```
Reference implementation (translate to TypeScript):

File: reference/pricing.py
```python
def calculate_discount(tier, amount):
    discounts = {'bronze': 0.05, 'silver': 0.10, 'gold': 0.15}
    return amount * discounts.get(tier, 0)
```

Translate this function to TypeScript, preserving the exact logic.
```

---

## Summary

The Compose IR is:
- ✅ **Minimal** - Only essential information
- ✅ **Framework-agnostic** - No runtime dependencies
- ✅ **Serializable** - JSON format for caching
- ✅ **Composable** - Multi-file support
- ✅ **LLM-friendly** - Easy to convert to prompts

**Three IR types for three keywords:**
- ModelIR ← `model`
- FeatureIR ← `feature`
- GuideIR ← `guide`

That's it. 🎯

# Compose IR Specification

This document defines the **Intermediate Representation (IR)** format used by the Compose compiler.

---

## Purpose

The ComposeIR is a **JSON-based, target-agnostic representation** of a Compose program. It serves as the bridge between:

1. The **Compose compiler** (lexer, parser, analyzer)
2. The **LLM code generator** (which produces actual source code)

The IR is designed to be:
- **Complete**: Contains all information needed for code generation
- **Structured**: Easy for both machines and LLMs to parse
- **Modular**: Each `.compose` file produces separate IR
- **Incremental**: Unchanged modules reuse cached IR

---

## IR Structure

Each `.compose` file compiles to a single IR module:

```json
{
  "version": "1.0",
  "module": "shared/customer.compose",
  "hash": "abc123...",
  "imports": [...],
  "structures": [...],
  "variables": [...],
  "functions": [...],
  "frontend": {...},
  "backend": {...},
  "context": [...]
}
```

---

## Top-Level Fields

### `version`
**Type**: `string`  
**Description**: IR schema version (e.g., `"1.0"`)

### `module`
**Type**: `string`  
**Description**: Relative path to source `.compose` file

### `hash`
**Type**: `string`  
**Description**: Content hash for change detection

### `imports`
**Type**: `Array<string>`  
**Description**: List of imported module paths

**Example**:
```json
"imports": [
  "shared/types.compose",
  "backend/database.compose"
]
```

---

## Data Definitions

### `structures`
**Type**: `Array<Structure>`

Defines all data structures (types/classes).

**Structure Schema**:
```json
{
  "name": "Customer",
  "fields": [
    {
      "name": "id",
      "type": "number"
    },
    {
      "name": "name",
      "type": "text"
    },
    {
      "name": "createdAt",
      "type": "datetime"
    }
  ],
  "location": {
    "line": 3,
    "file": "shared/customer.compose"
  }
}
```

### `variables`
**Type**: `Array<Variable>`

Defines module-level variables.

**Variable Schema**:
```json
{
  "name": "currentUser",
  "type": "User",
  "explanation": null,
  "location": {...}
}
```

**Explained Variable Example**:
```json
{
  "name": "startDate",
  "type": null,
  "explanation": "a date object representing today's date",
  "location": {...}
}
```

---

## Functions

### `functions`
**Type**: `Array<Function>`

**Function Schema**:
```json
{
  "name": "calculateAge",
  "inputs": [
    {
      "name": "birthdate",
      "type": "date"
    }
  ],
  "returns": "number",
  "description": "Calculate age from birthdate using today's date",
  "location": {...}
}
```

**Complex Function Example**:
```json
{
  "name": "generateReport",
  "inputs": [
    {
      "name": "transactions",
      "type": {
        "kind": "list",
        "of": "Transaction"
      }
    }
  ],
  "returns": "Report",
  "description": "Aggregate transaction data, compute trends, and format as Report",
  "location": {...}
}
```

---

## Frontend Definitions

### `frontend`
**Type**: `Object`

Contains all frontend-related definitions.

```json
"frontend": {
  "pages": [...],
  "components": [...],
  "state": [...],
  "renders": [...],
  "themes": [...]
}
```

### `frontend.pages`

**Page Schema**:
```json
{
  "name": "Dashboard",
  "protected": true,
  "description": "Shows financial metrics and charts",
  "location": {...}
}
```

### `frontend.components`

**Component Schema**:
```json
{
  "name": "CustomerCard",
  "props": [
    {
      "name": "customer",
      "type": "Customer"
    }
  ],
  "description": "Renders a customer box with details",
  "location": {...}
}
```

**Component Without Props**:
```json
{
  "name": "Loader",
  "props": [],
  "description": "A spinning loader used across the app",
  "location": {...}
}
```

### `frontend.state`

**State Schema**:
```json
{
  "name": "selectedTab",
  "explanation": "stores the currently active tab",
  "location": {...}
}
```

### `frontend.renders`

**Render Schema**:
```json
{
  "target": "Dashboard",
  "description": "Shows tiles, charts, and tables",
  "location": {...}
}
```

### `frontend.themes`

**Theme Schema**:
```json
{
  "name": "main",
  "properties": {
    "primaryColor": "#1055FF",
    "accentColor": "#00A38C"
  },
  "location": {...}
}
```

---

## Backend Definitions

### `backend`
**Type**: `Object`

Contains all backend-related definitions.

```json
"backend": {
  "env": [...],
  "files": {...},
  "apis": [...],
  "queries": [...],
  "connections": [...],
  "sockets": [...]
}
```

### `backend.env`

**Environment Variable Schema**:
```json
{
  "name": "DATABASE_URL",
  "location": {...}
}
```

### `backend.files`

**File Operations Schema**:
```json
{
  "reads": ["config.json", "templates/email.html"],
  "writes": ["output/report.pdf", "logs/activity.log"]
}
```

### `backend.apis`

**API Schema**:
```json
{
  "name": "GetCustomer",
  "description": "Fetch a single customer by ID",
  "location": {...}
}
```

### `backend.queries`

**Query Schema**:
```json
{
  "name": "FetchInvoices",
  "description": "Return all invoices for a customer",
  "location": {...}
}
```

### `backend.connections`

**Connection Schema**:
```json
{
  "name": "email_provider",
  "config": {
    "apiKey": "EMAIL_API_KEY"
  },
  "location": {...}
}
```

### `backend.sockets`

**Socket Schema**:
```json
{
  "event": "invoice.updates",
  "description": "Broadcasts invoice refresh events to clients",
  "location": {...}
}
```

---

## Context Comments

### `context`
**Type**: `Array<string>`

Stores all context comments (`##...##`) for LLM guidance.

**Example**:
```json
"context": [
  "This module handles customer authentication",
  "Integrates with Auth0 for SSO"
]
```

---

## Type Representation

Types are represented as:

### Primitive Types
```json
"number"
"text"
"boolean"
"date"
"datetime"
"void"
```

### Custom Types
```json
"Customer"
"Invoice"
```

### List Types
```json
{
  "kind": "list",
  "of": "Customer"
}
```

Nested lists:
```json
{
  "kind": "list",
  "of": {
    "kind": "list",
    "of": "number"
  }
}
```

---

## Complete IR Example

**Source** (`customer.compose`):
```compose
import "shared/types.compose"

## Customer management module ##

define structure Customer
  has id as number
  has name as text

define customers as list of Customer

frontend.page "Customers"
  is protected
  description: "Manage customer list"

backend.create_api "GetCustomers"
  description: "Fetch all customers"

define function validateEmail
  inputs: email as text
  returns: boolean
  description: "Check email format validity"
```

**Generated IR**:
```json
{
  "version": "1.0",
  "module": "customer.compose",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "imports": ["shared/types.compose"],
  "structures": [
    {
      "name": "Customer",
      "fields": [
        {"name": "id", "type": "number"},
        {"name": "name", "type": "text"}
      ],
      "location": {"line": 5, "file": "customer.compose"}
    }
  ],
  "variables": [
    {
      "name": "customers",
      "type": {"kind": "list", "of": "Customer"},
      "explanation": null,
      "location": {"line": 9, "file": "customer.compose"}
    }
  ],
  "functions": [
    {
      "name": "validateEmail",
      "inputs": [{"name": "email", "type": "text"}],
      "returns": "boolean",
      "description": "Check email format validity",
      "location": {"line": 17, "file": "customer.compose"}
    }
  ],
  "frontend": {
    "pages": [
      {
        "name": "Customers",
        "protected": true,
        "description": "Manage customer list",
        "location": {"line": 11, "file": "customer.compose"}
      }
    ],
    "components": [],
    "state": [],
    "renders": [],
    "themes": []
  },
  "backend": {
    "env": [],
    "files": {"reads": [], "writes": []},
    "apis": [
      {
        "name": "GetCustomers",
        "description": "Fetch all customers",
        "location": {"line": 15, "file": "customer.compose"}
      }
    ],
    "queries": [],
    "connections": [],
    "sockets": []
  },
  "context": ["Customer management module"]
}
```

---

## IR Validation

The IR must satisfy:

1. **All referenced types exist** (in structures or primitives)
2. **No circular dependencies** in imports
3. **Valid location metadata** for all nodes
4. **Consistent type representations**

---

## IR Caching

IR modules are cached based on content hash:

```
.compose-cache/
  e3b0c4429.json    ← customer.compose IR
  a1b2c3d4e.json    ← types.compose IR
```

Cache invalidation occurs when:
- Source file changes
- Imports change
- Compiler version changes

---

## Summary

The ComposeIR is:
- ✅ JSON-based and structured
- ✅ Target-agnostic
- ✅ Contains all semantic information
- ✅ Optimized for LLM consumption
- ✅ Supports incremental compilation
- ✅ Includes source location metadata

This IR enables deterministic, high-quality code generation across multiple target platforms.

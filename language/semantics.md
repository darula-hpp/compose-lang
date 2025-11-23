# Compose Language — Specification (v1 Draft)

Compose is an English-based, unopinionated, structured programming language designed specifically for LLM-assisted code generation. It is *not* a conventional programming language — instead, it acts as a **high‑level, deterministic instruction layer** that an LLM translates into real source code for multiple targets (frontend, backend, mobile, scripting, etc.).

Compose ensures consistency by providing:

* A minimal, predictable grammar
* A structured way to describe applications in English
* Clear macros for frontend, backend, functions, data structures, APIs, components, state, sockets, and IO
* A target‑agnostic Intermediate Representation (IR)

This document describes the **language features**, **syntax**, and **core semantics** agreed for Compose v1.

---

## 1. Principles of Compose

### 1.1 Human-readable but structured

Compose aims to be natural English, but still enforce structure. LLMs can interpret long descriptions, but the syntax ensures predictable parsing.

### 1.2 LLM-assisted code generation

The compiler outputs IR, but an LLM performs the actual code generation into any target (React, Python, Node.js, Django, etc.).

### 1.3 Unopinionated

Compose does not force architecture patterns. Instead, it describes intent:

* what the app does
* what data exists
* what pages/components look like
* what backend endpoints do

### 1.4 Modular

Files are treated independently. If only one file is updated, only that segment is re-generated.

### 1.5 Expressive

You can describe functions, behaviors, UI, logic, and state using pure English.

---

## 2. File Structure

Compose projects contain many `.compose` files, each representing a module:

```
project.compose           # top-level
frontend/…                # frontend pages & components
backend/…                 # apis, queries, services
shared/…                  # structures, functions
```

Imports are done using:

```compose
import "shared/customer.compose"
```

---

## 3. Comments

Compose supports two types of comments.

### 3.1 Normal comments (ignored entirely)

```compose
// normal comment
```

### 3.2 Context comments (interpreted into IR and passed to LLM for guidance)

```compose
## This module syncs invoice data across distributed branches ##
```

Context comments appear standalone on their own line.

---

## 4. Data Definition

### 4.1 Structures (similar to types/classes)

```compose
define structure Customer
  has id as number
  has name as text
  has dateOfBirth as date
```

### 4.2 Variables

#### Normal variable

```compose
define total as number
```

#### Explained variable (LLM determines initialization)

```compose
define startDate as "a date object representing today's date"
```

#### Structure variable

```compose
define currentCustomer as Customer
```

#### Arrays

```compose
define customers as list of Customer
```

---

## 5. Frontend DSL

Frontend rules are namespaced with the `frontend.` prefix.

### 5.1 Pages

```compose
frontend.page "Dashboard"
  is protected
  description: "Shows financial metrics and charts"
```

### 5.2 Components

```compose
frontend.component "Loader"
  description: "A spinning loader used across the app"
```

### 5.3 Components With Data

```compose
frontend.component "CustomerCard"
  accepts customer as Customer
  description: "Renders a customer box with details"
```

### 5.4 State

```compose
frontend.state selectedTab as "stores the currently active tab"
```

### 5.5 Rendering

```compose
frontend.render "Dashboard"
  description: "Shows tiles, charts, and tables"
```

### 5.6 Themes

```compose
frontend.theme "main"
  primaryColor: "#1055FF"
  accentColor: "#00A38C"
```

---

## 6. Backend DSL

Backend rules are namespaced under `backend.`

### 6.1 Environment Variables

```compose
backend.read_env DATABASE_URL
backend.read_env EMAIL_API_KEY
```

### 6.2 File System

```compose
backend.read_file "config.json"
backend.save_file "output/report.pdf"
```

### 6.3 APIs

```compose
backend.create_api "GetCustomer"
  description: "Fetch a single customer by ID"
```

### 6.4 Queries

```compose
backend.query "FetchInvoices"
  description: "Return all invoices for a customer"
```

### 6.5 External Services

```compose
backend.connect "email_provider"
  with apiKey: EMAIL_API_KEY
```

### 6.6 Sockets

```compose
backend.emit "invoice.updates"
  description: "Broadcasts invoice refresh events to clients"
```

---

## 7. Functions

Functions describe behavior using **pure English**, not code.

### 7.1 Basic Function

```compose
define function calculateAge
  inputs: birthdate as date
  returns: number
  description: "Calculate age from birthdate using today's date"
```

### 7.2 Complex Function

```compose
define function generateMonthlyReport
  inputs: invoices as list of Invoice
  returns: Report
  description: "Summarize totals, group by type, compute trends, and return a Report object"
```

The LLM translates descriptions into real code.

---

## 8. Pages, Components, Backend, and Frontend Separation

Compose enforces separation:

* Frontend → UI, components, state, pages
* Backend → APIs, queries, database, fs, env, sockets
* Shared → structures and functions

This helps the compiler generate modular IR and update only modified pieces.

---

## 9. Using Multiple Files

Compose supports multi-file imports:

```compose
import "shared/types.compose"
import "backend/invoices.compose"
```

Each file's IR is stored separately enabling incremental code regeneration.

---

## 10. compose.json

Controls code generation output.

```json
{
  "targets": {
    "frontend": {
      "type": "react",
      "output": "./generated/frontend",
      "dependencies": ["react", "chakra-ui", "react-router-dom"]
    },
    "backend": {
      "type": "node",
      "output": "./generated/backend",
      "dependencies": ["express", "pg"]
    }
  }
}
```

Targets + IR + LLM = final project code.

---

## 11. Macro Philosophy

Compose macros are:

* Non-opinionated
* Minimal
* High-level
* Easy to parse
* LLM-friendly

Examples of macros:

* `define structure`
* `define function`
* `define component`
* `frontend.*`
* `backend.*`
* `import`
* `define <variable>`

---

## 12. What Compose Is NOT

* Not a runtime language
* Not executing instructions itself
* Not a markup language
* Not a templating system

Compose is a **structured instruction layer**.

---

## 13. Purpose of Compose

Compose is designed for:

* Developers
* Non-developers
* AI-first builders
* Companies building internal tools
* Big applications (not only small landing pages)

The language's strength comes from:

* Natural English + structure
* IR consistency
* Incremental generation
* Full app modeling

---

## 14. Future Features (Post-v1)

* OOP: classes, inheritance, methods
* Async workflows
* Advanced socket rooms
* Built-in auth macros
* Plugin system
* Better type inference
* Declarative animations
* Compose Studio (GUI composer)

---

## 15. Summary

Compose v1 provides:

* A structured English-based DSL
* A macro system for frontend + backend
* Pure English function descriptions
* Structures, variables, explained variables, arrays
* Pages, components, themes
* Backend APIs, queries, env, fs, sockets
* imports
* `compose.json` for codegen control
* Clear IR separation

It is designed to be **the best structured language for LLM code generation**, supporting large multi-file applications.

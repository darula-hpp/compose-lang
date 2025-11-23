# Compose Standard Library Specification

This document describes the **standard library** (`stdlib`) provided with Compose.

---

## Overview

The Compose standard library provides ready-to-use modules for common tasks:

- **UI Components** (`stdlib/ui`)
- **Data Operations** (`stdlib/data`)
- **File System** (`stdlib/fs`)
- **Networking** (`stdlib/net`)

All stdlib modules are implemented in Compose and can be imported like any other module.

---

## Import Syntax

```compose
import "stdlib/ui/button.compose"
import "stdlib/data/validators.compose"
import "stdlib/fs/json.compose"
import "stdlib/net/http.compose"
```

---

## 1. UI Library (`stdlib/ui`)

### 1.1 Components

#### `Button`
```compose
frontend.component "Button"
  accepts label as text
  accepts onClick as "function to call on click"
  accepts variant as text
  description: "Reusable button component with theme support"
```

**Variants**: `primary`, `secondary`, `danger`, `ghost`

---

#### `Input`
```compose
frontend.component "Input"
  accepts placeholder as text
  accepts value as text
  accepts onChange as "function called when value changes"
  description: "Text input field with validation support"
```

---

#### `Modal`
```compose
frontend.component "Modal"
  accepts isOpen as boolean
  accepts onClose as "function to close modal"
  accepts title as text
  description: "Overlay modal dialog"
```

---

#### `Table`
```compose
frontend.component "Table"
  accepts columns as "list of column definitions"
  accepts data as "list of row data"
  accepts onRowClick as "function called when row is clicked"
  description: "Data table with sorting and pagination"
```

---

#### `Loader`
```compose
frontend.component "Loader"
  accepts size as text
  description: "Spinning loader indicator"
```

**Sizes**: `small`, `medium`, `large`

---

### 1.2 Layouts

#### `Container`
```compose
frontend.component "Container"
  accepts maxWidth as text
  description: "Centered content container with max-width"
```

---

#### `Grid`
```compose
frontend.component "Grid"
  accepts columns as number
  accepts gap as text
  description: "Responsive grid layout"
```

---

#### `Stack`
```compose
frontend.component "Stack"
  accepts direction as text
  accepts spacing as text
  description: "Flexbox stack layout (vertical or horizontal)"
```

**Directions**: `vertical`, `horizontal`

---

## 2. Data Library (`stdlib/data`)

### 2.1 Validators

#### `isEmail`
```compose
define function isEmail
  inputs: value as text
  returns: boolean
  description: "Check if value is a valid email address"
```

---

#### `isURL`
```compose
define function isURL
  inputs: value as text
  returns: boolean
  description: "Check if value is a valid URL"
```

---

#### `isNumeric`
```compose
define function isNumeric
  inputs: value as text
  returns: boolean
  description: "Check if value contains only numeric characters"
```

---

#### `isEmpty`
```compose
define function isEmpty
  inputs: value as text
  returns: boolean
  description: "Check if value is empty or whitespace"
```

---

### 2.2 Formatters

#### `formatCurrency`
```compose
define function formatCurrency
  inputs: amount as number, currency as text
  returns: text
  description: "Format number as currency (e.g., $1,234.56)"
```

---

#### `formatDate`
```compose
define function formatDate
  inputs: date as date, format as text
  returns: text
  description: "Format date as text (e.g., 'YYYY-MM-DD')"
```

---

#### `formatPhoneNumber`
```compose
define function formatPhoneNumber
  inputs: phone as text, country as text
  returns: text
  description: "Format phone number for specified country"
```

---

### 2.3 Transformers

#### `slugify`
```compose
define function slugify
  inputs: text as text
  returns: text
  description: "Convert text to URL-friendly slug"
```

**Example**: `"Hello World"` → `"hello-world"`

---

#### `truncate`
```compose
define function truncate
  inputs: text as text, maxLength as number
  returns: text
  description: "Truncate text to max length with ellipsis"
```

---

#### `capitalize`
```compose
define function capitalize
  inputs: text as text
  returns: text
  description: "Capitalize first letter of each word"
```

---

## 3. File System Library (`stdlib/fs`)

### 3.1 JSON Operations

#### `parseJSON`
```compose
define function parseJSON
  inputs: jsonString as text
  returns: "parsed object"
  description: "Parse JSON string into object"
```

---

#### `stringifyJSON`
```compose
define function stringifyJSON
  inputs: object as "any object"
  returns: text
  description: "Convert object to JSON string"
```

---

### 3.2 CSV Operations

#### `parseCSV`
```compose
define function parseCSV
  inputs: csvString as text
  returns: "list of objects"
  description: "Parse CSV string into list of objects"
```

---

#### `generateCSV`
```compose
define function generateCSV
  inputs: data as "list of objects"
  returns: text
  description: "Convert list of objects to CSV string"
```

---

### 3.3 File Reading

#### `readTextFile`
```compose
define function readTextFile
  inputs: path as text
  returns: text
  description: "Read file contents as text"
```

---

#### `writeTextFile`
```compose
define function writeTextFile
  inputs: path as text, content as text
  returns: boolean
  description: "Write text to file, return success status"
```

---

## 4. Networking Library (`stdlib/net`)

### 4.1 HTTP

#### `httpGet`
```compose
define function httpGet
  inputs: url as text, headers as "object of headers"
  returns: "response object"
  description: "Perform HTTP GET request"
```

---

#### `httpPost`
```compose
define function httpPost
  inputs: url as text, body as "request body", headers as "object of headers"
  returns: "response object"
  description: "Perform HTTP POST request"
```

---

#### `httpPut`
```compose
define function httpPut
  inputs: url as text, body as "request body", headers as "object of headers"
  returns: "response object"
  description: "Perform HTTP PUT request"
```

---

#### `httpDelete`
```compose
define function httpDelete
  inputs: url as text, headers as "object of headers"
  returns: "response object"
  description: "Perform HTTP DELETE request"
```

---

### 4.2 WebSockets

#### `createSocket`
```compose
define function createSocket
  inputs: url as text
  returns: "socket connection"
  description: "Create WebSocket connection"
```

---

#### `socketSend`
```compose
define function socketSend
  inputs: socket as "socket connection", message as text
  returns: boolean
  description: "Send message through WebSocket"
```

---

#### `socketListen`
```compose
define function socketListen
  inputs: socket as "socket connection", event as text, handler as "event handler function"
  returns: void
  description: "Listen for WebSocket events"
```

---

## 5. Auth Library (`stdlib/auth`) [Future]

*Planned for post-v1*

```compose
import "stdlib/auth/session.compose"

define function authenticateUser
define function createSession
define function validateToken
```

---

## Using Standard Library

### Example 1: Form Validation

```compose
import "stdlib/ui/input.compose"
import "stdlib/ui/button.compose"
import "stdlib/data/validators.compose"

frontend.component "LoginForm"
  description: "Login form with email validation"

define function validateLoginForm
  inputs: email as text, password as text
  returns: boolean
  description: "Validate email format and password length using stdlib validators"
```

---

### Example 2: API Data Fetching

```compose
import "stdlib/net/http.compose"
import "stdlib/data/formatters.compose"

define function fetchUserData
  inputs: userId as number
  returns: "user object"
  description: "Fetch user from API and format dates"

backend.query "GetUser"
  description: "Call external API using httpGet from stdlib"
```

---

### Example 3: File Export

```compose
import "stdlib/fs/csv.compose"
import "stdlib/data/formatters.compose"

define function exportCustomersToCSV
  inputs: customers as list of Customer
  returns: text
  description: "Generate CSV file from customer list"
```

---

## Extending Standard Library

Developers can contribute to stdlib by:

1. Creating new `.compose` modules
2. Following stdlib conventions
3. Submitting pull requests

**Guidelines**:
- Use clear, descriptive function names
- Provide detailed descriptions
- Include usage examples
- Keep modules focused (single responsibility)

---

## Summary

The Compose standard library provides:

✅ **UI components** for common interfaces  
✅ **Data utilities** for validation, formatting, transformation  
✅ **File system** operations (JSON, CSV, text files)  
✅ **Network** utilities (HTTP, WebSockets)  
✅ **Extensible** architecture for community contributions

All stdlib code is pure Compose, making it easy to understand, customize, and extend.

# Compose Language Tokens

This document describes all tokens (lexical elements) recognized by the Compose lexer.

---

## Token Categories

### 1. Keywords

Keywords are reserved words with special meaning in Compose.

#### General Keywords
- `import` — Import another Compose file
- `define` — Start a definition
- `structure` — Define a data structure
- `function` — Define a function
- `has` — Declare a field in a structure
- `as` — Type annotation
- `is` — Attribute declaration
- `list` — Array type modifier
- `of` — Used with `list`

#### Frontend Keywords
- `frontend.page` — Define a page
- `frontend.component` — Define a component
- `frontend.state` — Define state variable
- `frontend.render` — Define rendering logic
- `frontend.theme` — Define theme

#### Backend Keywords
- `backend.read_env` — Read environment variable
- `backend.read_file` — Read file
- `backend.save_file` — Write file
- `backend.create_api` — Define API endpoint
- `backend.query` — Define database query
- `backend.connect` — Connect to external service
- `backend.emit` — Emit socket event

#### Attribute Keywords
- `protected` — Page protection flag
- `description` — Descriptive text
- `inputs` — Function parameters
- `returns` — Function return type
- `accepts` — Component prop
- `with` — Service configuration

---

### 2. Primitive Types

Built-in type names:

- `number` — Numeric values (int or float)
- `text` — String values
- `boolean` — True/false values
- `date` — Date without time
- `datetime` — Date with time
- `void` — No return value

---

### 3. Identifiers

**Pattern**: `[a-zA-Z_][a-zA-Z0-9_]*`

**Examples**:
- `Customer`
- `totalRevenue`
- `user_id`
- `API_KEY`

**Rules**:
- Must start with a letter or underscore
- Can contain letters, digits, and underscores
- Case-sensitive
- Cannot be a reserved keyword

---

### 4. Literals

#### String Literals

**Pattern**: `"[^"]*"`

**Examples**:
- `"Dashboard"`
- `"Calculate age from birthdate"`
- `"#1055FF"`

**Rules**:
- Enclosed in double quotes
- No escape sequences in v1 (future feature)
- Can contain any characters except unescaped quotes

---

### 5. Operators & Punctuation

#### Structural
- `:` — Key-value separator (used in attributes)
- `,` — Parameter separator

#### Grouping
- Indentation (2 spaces) — Block nesting

---

### 6. Comments

#### Normal Comment
**Pattern**: `//.*$`

**Example**:
```compose
// This is a normal comment
```

**Behavior**: Ignored by compiler

#### Context Comment
**Pattern**: `##.*##`

**Example**:
```compose
## This provides context to the LLM ##
```

**Behavior**: Included in IR for LLM guidance

---

### 7. Whitespace

- **Space** — Ignored except for indentation
- **Newline** (`\n` or `\r\n`) — Statement terminator
- **Indentation** (2 spaces per level) — Defines block structure

---

## Token Examples

### Example 1: Structure Definition

```compose
define structure User
  has id as number
  has name as text
```

**Tokens**:
1. `DEFINE` (keyword)
2. `STRUCTURE` (keyword)
3. `User` (identifier)
4. `NEWLINE`
5. `INDENT`
6. `HAS` (keyword)
7. `id` (identifier)
8. `AS` (keyword)
9. `NUMBER` (type)
10. `NEWLINE`
11. `HAS` (keyword)
12. `name` (identifier)
13. `AS` (keyword)
14. `TEXT` (type)
15. `NEWLINE`
16. `DEDENT`

---

### Example 2: Frontend Page

```compose
frontend.page "Dashboard"
  is protected
  description: "Main dashboard view"
```

**Tokens**:
1. `FRONTEND_PAGE` (keyword)
2. `"Dashboard"` (string literal)
3. `NEWLINE`
4. `INDENT`
5. `IS` (keyword)
6. `PROTECTED` (keyword)
7. `NEWLINE`
8. `DESCRIPTION` (keyword)
9. `:` (colon)
10. `"Main dashboard view"` (string literal)
11. `NEWLINE`
12. `DEDENT`

---

### Example 3: Function Definition

```compose
define function calculateTotal
  inputs: items as list of Item
  returns: number
  description: "Sum all item prices"
```

**Tokens**:
1. `DEFINE` (keyword)
2. `FUNCTION` (keyword)
3. `calculateTotal` (identifier)
4. `NEWLINE`
5. `INDENT`
6. `INPUTS` (keyword)
7. `:` (colon)
8. `items` (identifier)
9. `AS` (keyword)
10. `LIST` (keyword)
11. `OF` (keyword)
12. `Item` (identifier)
13. `NEWLINE`
14. `RETURNS` (keyword)
15. `:` (colon)
16. `NUMBER` (type)
17. `NEWLINE`
18. `DESCRIPTION` (keyword)
19. `:` (colon)
20. `"Sum all item prices"` (string literal)
21. `NEWLINE`
22. `DEDENT`

---

## Reserved Words (Complete List)

```
import
define
structure
function
has
as
is
list
of
frontend.page
frontend.component
frontend.state
frontend.render
frontend.theme
backend.read_env
backend.read_file
backend.save_file
backend.create_api
backend.query
backend.connect
backend.emit
protected
description
inputs
returns
accepts
with
number
text
boolean
date
datetime
void
```

---

## Lexer Implementation Notes

1. **Indentation Tracking**: Lexer must track indentation levels and emit `INDENT`/`DEDENT` tokens
2. **Line-based**: Each logical line is a complete statement
3. **Comment Handling**: Normal comments ignored; context comments preserved
4. **String Parsing**: Double-quoted strings only; no escape sequences in v1
5. **Keyword Matching**: Exact case-sensitive match required
6. **Dot Notation**: `frontend.page` is treated as a single keyword token

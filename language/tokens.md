# Compose Language Tokens

This document describes all tokens (lexical elements) recognized by the Compose lexer v0.2.0.

---

## Token Categories

### 1. Keywords

Reserved words with special meaning in Compose:

- `model` — Define a data structure
- `feature` — Define application behavior
- `guide` — Define implementation hints/details
- `import` — Import another .compose file
- `list` — Array type modifier (used with `of`)
- `of` — Used with `list` (e.g., `list of text`)

**Total keywords: 6**

---

### 2. Primitive Types

Built-in type names:

- `text` — String values
- `number` — Numeric values (integer or float)
- `bool` — Boolean values (true/false)
- `date` — Date without time
- `timestamp` — Date with time
- `image` — Image file reference
- `file` — Generic file reference
- `markdown` — Markdown-formatted text
- `json` — JSON data

**Total types: 9**

---

### 3. Identifiers

**Pattern**: `[a-zA-Z_][a-zA-Z0-9_]*`

**Examples**:
- `User`
- `totalPrice`
- `user_id`
- `CustomerId`

**Rules**:
- Must start with a letter or underscore
- Can contain letters, digits, and underscores
- Case-sensitive
- Cannot be a reserved keyword or type name

---

### 4. Literals

#### String Literals

**Pattern**: `"[^"]*"`

**Examples**:
- `"User Management"`
- `"Calculate total from items"`
- `"admin"`

**Rules**:
- Enclosed in double quotes
- Used for feature/guide names and enum values
- Can contain any characters except unescaped quotes

---

### 5. Operators & Punctuation

#### Type Annotations
- `:` — Type separator (e.g., `name: text`)

#### Type Modifiers
- `?` — Optional marker (e.g., `email: text?`)
- `|` — Enum separator (e.g., `"admin" | "member"`)

#### Code References
- `@` — Reference external code (e.g., `@reference/pricing.py`)
- `::` — Function reference (e.g., `@file.py::functionName`)

#### List Markers
- `-` — Bullet point (in feature/guide items)

---

### 6. Comments

#### Comment
**Pattern**: `#.*$`

**Example**:
```compose
# This is a comment
```

**Behavior**: Ignored by compiler (used for documentation)

---

### 7. Whitespace

- **Space** — Ignored except for indentation
- **Newline** (`\n` or `\r\n`) — Statement terminator
- **Indentation** (2 spaces recommended) — Defines block structure

**Indentation Tokens**:
- `INDENT` — Emitted when indentation increases
- `DEDENT` — Emitted when indentation decreases

---

## Token Examples

### Example 1: Model Definition

```compose
model User:
  name: text
  email: text?
```

**Tokens**:
1. `MODEL` (keyword)
2. `User` (identifier)
3. `:` (colon)
4. `NEWLINE`
5. `INDENT`
6. `name` (identifier)
7. `:` (colon)
8. `TEXT` (type)
9. `NEWLINE`
10. `email` (identifier)
11. `:` (colon)
12. `TEXT` (type)
13. `?` (optional marker)
14. `NEWLINE`
15. `DEDENT`

---

### Example 2: Feature Declaration

```compose
feature "User Management":
  - Create and edit users
  - Delete users with confirmation
```

**Tokens**:
1. `FEATURE` (keyword)
2. `"User Management"` (string literal)
3. `:` (colon)
4. `NEWLINE`
5. `INDENT`
6. `-` (bullet)
7. `Create and edit users` (text)
8. `NEWLINE`
9. `-` (bullet)
10. `Delete users with confirmation` (text)
11. `NEWLINE`
12. `DEDENT`

---

### Example 3: Guide Declaration

```compose
guide "Security":
  - Use bcrypt cost 12
  - Rate limit 5 attempts per 15 min
```

**Tokens**:
1. `GUIDE` (keyword)
2. `"Security"` (string literal)
3. `:` (colon)
4. `NEWLINE`
5. `INDENT`
6. `-` (bullet)
7. `Use bcrypt cost 12` (text)
8. `NEWLINE`
9. `-` (bullet)
10. `Rate limit 5 attempts per 15 min` (text)
11. `NEWLINE`
12. `DEDENT`

---

### Example 4: Enum Type

```compose
model User:
  role: "admin" | "member" | "guest"
```

**Tokens**:
1. `MODEL` (keyword)
2. `User` (identifier)
3. `:` (colon)
4. `NEWLINE`
5. `INDENT`
6. `role` (identifier)
7. `:` (colon)
8. `"admin"` (string literal)
9. `|` (pipe)
10. `"member"` (string literal)
11. `|` (pipe)
12. `"guest"` (string literal)
13. `NEWLINE`
14. `DEDENT`

---

### Example 5: List Type

```compose
model Order:
  items: list of Product
  tags: list of text
```

**Tokens**:
1. `MODEL` (keyword)
2. `Order` (identifier)
3. `:` (colon)
4. `NEWLINE`
5. `INDENT`
6. `items` (identifier)
7. `:` (colon)
8. `LIST` (keyword)
9. `OF` (keyword)
10. `Product` (identifier)
11. `NEWLINE`
12. `tags` (identifier)
13. `:` (colon)
14. `LIST` (keyword)
15. `OF` (keyword)
16. `TEXT` (type)
17. `NEWLINE`
18. `DEDENT`

---

### Example 6: Reference Code

```compose
feature "Pricing":
  - Reference: @reference/pricing.py
```

**Tokens**:
1. `FEATURE` (keyword)
2. `"Pricing"` (string literal)
3. `:` (colon)
4. `NEWLINE`
5. `INDENT`
6. `-` (bullet)
7. `Reference:` (text)
8. `@` (at symbol)
9. `reference/pricing.py` (file path)
10. `NEWLINE`
11. `DEDENT`

---

## Reserved Words (Complete List)

### Keywords (6)
```
model
feature
guide
import
list
of
```

### Type Names (9)
```
text
number
bool
date
timestamp
image
file
markdown
json
```

**Total Reserved: 15 words**

---

## Lexer Implementation Notes

### 1. Indentation Tracking
Lexer must:
- Track current indentation level
- Emit `INDENT` when indentation increases
- Emit `DEDENT` when indentation decreases
- Validate consistent indentation (2 spaces recommended)

### 2. Line-based Parsing
- Each line is parsed independently
- Newlines are significant statement terminators
- Indentation determines block structure

### 3. Comment Handling
- Lines starting with `#` are comments
- Comments are stripped during tokenization
- Do not appear in token stream

### 4. String Parsing
- Only double-quoted strings (`"..."`)
- No escape sequences in v0.2.0
- Used for feature/guide names and enum values

### 5. Keyword Matching
- Exact case-sensitive match required
- `model` is a keyword, `Model` is an identifier
- Multi-word keywords don't exist (unlike old `frontend.page`)

### 6. Type Resolution
- Type names are keywords when used in type position
- Can also be identifiers when used as model references
- Context determines interpretation

### 7. Operator Precedence
Not applicable - Compose has no expressions, only declarations

---

## Comparison with v0.1.0

### Removed (Old Syntax)
- ❌ `define`, `structure`, `function`, `has`, `as`, `is`
- ❌ `frontend.*`, `backend.*` keywords
- ❌ `protected`, `description`, `inputs`, `returns`, `accepts`
- ❌ Context comments (`##...##`)
- ❌ Type `boolean`, `datetime`, `void`

### Added (New Syntax)
- ✅ `model`, `feature`, `guide` (core keywords)
- ✅ `@` operator (reference code)
- ✅ `?` operator (optional fields)
- ✅ `|` operator (enum values)
- ✅ Types: `bool`, `timestamp`, `image`, `file`, `markdown`, `json`
- ✅ Simple `#` comments

### Net Result
- **91% fewer keywords** (6 vs 35+)
- **Simpler grammar** (3 constructs vs 20+)
- **More natural language** (feature descriptions vs rigid syntax)

---

## Token Type Enum (Implementation Reference)

```javascript
const TokenType = {
  // Keywords
  MODEL: 'MODEL',
  FEATURE: 'FEATURE',
  GUIDE: 'GUIDE',
  IMPORT: 'IMPORT',
  LIST: 'LIST',
  OF: 'OF',
  
  // Types
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  BOOL: 'BOOL',
  DATE: 'DATE',
  TIMESTAMP: 'TIMESTAMP',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  MARKDOWN: 'MARKDOWN',
  JSON: 'JSON',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  
  // Operators
  COLON: 'COLON',
  QUESTION: 'QUESTION',
  PIPE: 'PIPE',
  AT: 'AT',
  DOUBLE_COLON: 'DOUBLE_COLON',
  DASH: 'DASH',
  
  // Structure
  NEWLINE: 'NEWLINE',
  INDENT: 'INDENT',
  DEDENT: 'DEDENT',
  EOF: 'EOF'
};
```

---

## Summary

The Compose v0.2.0 lexer recognizes:

- ✅ **6 keywords** (model, feature, guide, import, list, of)
- ✅ **9 type names** (text, number, bool, date, timestamp, image, file, markdown, json)
- ✅ **7 operators** (`:`, `?`, `|`, `@`, `::`, `-`)
- ✅ **Identifiers** and **string literals**
- ✅ **Comments** (`#`)
- ✅ **Indentation** (INDENT/DEDENT tokens)

Total: **~15 reserved words** (compared to 35+ in v0.1.0)

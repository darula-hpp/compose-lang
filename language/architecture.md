# Compose Compiler Architecture

This document describes the architecture of the Compose compiler, from source code to executable output.

---

## Overview

The Compose compiler is a **multi-stage pipeline** that transforms `.compose` files into target language code (JavaScript, Python, Rust, etc.) with the assistance of an LLM.

```
┌──────────────┐
│ .compose     │
│ source files │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Lexer      │ ← Tokenization
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Parser     │ ← AST building
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Analyzer   │ ← Type checking, validation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│      IR      │ ← Intermediate Representation
│  (ComposeIR) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  LLM Emitter │ ← Code generation via LLM
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Target Code  │
│ (JS/Py/etc.) │
└──────────────┘
```

---

## Phase 1: Lexer (Tokenization)

**Location**: `compiler/lexer/`

**Input**: Raw `.compose` source code (string)  
**Output**: Stream of tokens

**Responsibilities**:
- Read source character-by-character
- Identify keywords, identifiers, literals, operators
- Track indentation levels (emit `INDENT`/`DEDENT` tokens)
- Strip normal comments (`//`)
- Preserve context comments (`##...##`)
- Handle newlines and whitespace

**Key Files**:
- `tokenizer.js` — Main tokenization logic
- `token-types.js` — Token type definitions
- `indentation-tracker.js` — Manages indent/dedent

**Example**:

```compose
define structure User
  has name as text
```

↓ Tokenized to:

```
DEFINE
STRUCTURE
IDENTIFIER("User")
NEWLINE
INDENT
HAS
IDENTIFIER("name")
AS
TYPE("text")
NEWLINE
DEDENT
```

---

## Phase 2: Parser (AST Building)

**Location**: `compiler/parser/`

**Input**: Token stream  
**Output**: Abstract Syntax Tree (AST)

**Responsibilities**:
- Build hierarchical tree structure
- Validate grammar rules
- Detect syntax errors
- Preserve source location metadata

**Key Files**:
- `parser.js` — Recursive descent parser
- `ast-nodes.js` — AST node class definitions
- `grammar-rules.js` — Grammar pattern matchers

**Example AST** (JSON representation):

```json
{
  "type": "Program",
  "body": [
    {
      "type": "StructureDefinition",
      "name": "User",
      "fields": [
        {
          "type": "FieldDefinition",
          "name": "name",
          "fieldType": "text"
        }
      ]
    }
  ]
}
```

---

## Phase 3: Analyzer (Semantic Analysis)

**Location**: `compiler/analyzer/`

**Input**: AST  
**Output**: Annotated AST + Symbol Table

**Responsibilities**:
- Type checking
- Scope resolution
- Detect undefined references
- Validate function signatures
- Check for duplicate definitions
- Ensure frontend/backend separation

**Key Files**:
- `type-checker.js` — Type validation
- `scope-resolver.js` — Variable scope tracking
- `validator.js` — Semantic rules enforcement
- `symbol-table.js` — Symbol tracking

**Checks**:
- ✅ All referenced types are defined
- ✅ Function inputs/returns match usage
- ✅ No circular imports
- ✅ Frontend doesn't reference backend internals

---

## Phase 4: IR Generation (Intermediate Representation)

**Location**: `compiler/ir/`

**Input**: Annotated AST  
**Output**: ComposeIR (JSON format)

**Responsibilities**:
- Transform AST into target-agnostic IR
- Normalize structures, functions, pages, components
- Include context comments for LLM guidance
- Generate module metadata

**Key Files**:
- `ir-builder.js` — AST → IR transformer
- `ir-schema.js` — IR format specification
- `module-registry.js` — Track all modules

**IR Structure**:

```json
{
  "module": "shared/user.compose",
  "structures": [...],
  "functions": [...],
  "variables": [...],
  "frontend": {
    "pages": [...],
    "components": [...],
    "state": [...],
    "themes": [...]
  },
  "backend": {
    "apis": [...],
    "queries": [...],
    "connections": [...]
  },
  "imports": [...],
  "context": [...]
}
```

---

## Phase 5: Code Emitter (LLM-Assisted Generation)

**Location**: `compiler/emitter/`

**Input**: ComposeIR + targets.json  
**Output**: Real source code (JS, Python, Rust, etc.)

**Responsibilities**:
- Read target specifications from `targets.json`
- Send IR + target info to LLM
- Receive generated code from LLM
- Write code to output directories
- Link runtime libraries

**Key Files**:
- `emitter.js` — Main orchestration
- `llm-client.js` — LLM API integration
- `template-engine.js` — Code scaffolding
- `output-writer.js` — File system operations

**LLM Prompt Structure**:

```
You are generating [target-type] code from ComposeIR.

Target: React with TypeScript
Dependencies: react, react-router-dom, chakra-ui

IR:
{...}

Generate production-ready code following best practices.
```

**Output Example** (React):

```javascript
// generated/frontend/pages/Dashboard.tsx
export default function Dashboard() {
  // ... LLM-generated code
}
```

---

## Phase 6: Runtime Linker

**Location**: `compiler/runtime-linker/`

**Input**: Generated code + runtime libraries  
**Output**: Complete, runnable project

**Responsibilities**:
- Copy runtime helpers into output directory
- Link standard library functions
- Generate package.json / requirements.txt
- Set up build configuration
- Create entry points

**Key Files**:
- `linker.js` — Link runtime dependencies
- `package-generator.js` — Generate package configs
- `entry-builder.js` — Create main entry files

---

## Supporting Modules

### Transformers (`compiler/transformers/`)

Optional plugins that modify IR before emission:

- `optimizer.js` — Remove unused definitions
- `validator.js` — Extra validation rules
- `prettifier.js` — Format IR for debugging

### Utils (`compiler/utils/`)

Shared utilities:

- `error-reporter.js` — Pretty error messages
- `file-reader.js` — Read .compose files
- `logger.js` — Debug logging
- `config-loader.js` — Load targets.json

---

## Incremental Compilation

Compose supports **incremental updates**:

1. **Module Hashing**: Each `.compose` file has a content hash
2. **IR Caching**: IR is stored per-module
3. **Change Detection**: Only recompile changed modules
4. **Dependency Tracking**: Recompile dependents if imports change

**Flow**:

```
User edits user.compose
  ↓
Hash changes
  ↓
Recompile user.compose → new IR
  ↓
Check dependents (e.g., dashboard.compose imports user.compose)
  ↓
Recompile dependents
  ↓
Emit only affected files
```

---

## Error Handling

Errors are reported with:
- **File name** and **line number**
- **Error type** (syntax, semantic, etc.)
- **Helpful message**
- **Suggested fix** (when possible)

**Example**:

```
ERROR: Undefined type 'Custoemr' in user.compose:5:10

  3 | define structure Order
  4 |   has customer as Custoemr
              ^^^^^^^^^^^^^
  5 |   has total as number

Did you mean 'Customer'?
```

---

## CLI Integration

**Location**: `cli/`

The CLI wraps the compiler pipeline:

```bash
compose build    # Full compilation
compose dev      # Watch mode + hot reload
compose run      # Build + execute
```

---

## Summary

The Compose compiler is a **multi-phase, LLM-assisted pipeline**:

1. **Lexer** → Tokenize source
2. **Parser** → Build AST
3. **Analyzer** → Validate semantics
4. **IR Generator** → Create target-agnostic IR
5. **Emitter** → LLM generates real code
6. **Linker** → Package final project

This architecture ensures:
- ✅ Predictable, structured parsing
- ✅ Target independence
- ✅ LLM-powered code generation
- ✅ Incremental compilation
- ✅ Clear error reporting

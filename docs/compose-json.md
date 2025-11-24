# compose.json Specification

**Version:** 1.0.0

The `compose.json` file is the configuration file for Compose projects. It defines LLM settings, deployment targets, and build configuration.

---

## Structure

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "Project description",
  
  "llm": { ... },
  "targets": { ... },
  "global": { ... }
}
```

---

## Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `llm` | object | **Yes** | LLM configuration |
| `targets` | object | **Yes** | Deployment targets (at least one) |

**Minimum valid compose.json:**

```json
{
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "apiKey": "${GEMINI_API_KEY}"
  },
  "targets": {
    "web": {
      "entry": "./app.compose",
      "framework": "nextjs",
      "language": "typescript",
      "output": "./generated/web"
    }
  }
}
```

---

## LLM Configuration

**Required fields:**

```json
{
  "llm": {
    "provider": "gemini",        // Required: "gemini" | "openai" | "anthropic"
    "model": "model-name",       // Required: Model identifier
    "apiKey": "${ENV_VAR}",      // Required: API key (use env vars)
    "temperature": 0.2,          // Optional: 0.0-1.0 (default: 0.2)
    "maxTokens": 8192            // Optional: Max response tokens (default: 8192)
  }
}
```

### Supported Providers & Models

**Gemini (Google):**
```json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash",    // Fast, recommended
  "model": "gemini-1.5-pro",      // High quality
  "apiKey": "${GEMINI_API_KEY}"
}
```

**OpenAI:**
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo",
  "model": "gpt-4o",
  "apiKey": "${OPENAI_API_KEY}"
}
```

**Anthropic:**
```json
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet",
  "apiKey": "${ANTHROPIC_API_KEY}"
}
```

---

## Targets Configuration

**At least one target is required.**

Each target represents a deployment environment (web, API, mobile, etc.).

### Target Structure

```json
{
  "targets": {
    "web": {                          // Target name (user-defined)
      "entry": "./app.compose",       // Required: Entry point .compose file
      "framework": "nextjs",          // Required: Framework identifier
      "language": "typescript",       // Required: Output language
      "output": "./generated/web",    // Required: Output directory
      "type": "react",                // Optional: Type hint
      "dependencies": [...],          // Optional: Additional npm packages
      "assets": [...],                // Optional: Asset copying
      "extraRules": [...]             // Optional: LLM instructions
    }
  }
}
```

### Required Target Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entry` | string | **Yes** | Path to entry .compose file |
| `language` | string | **Yes** | Output language |
| `output` | string | **Yes** | Output directory path |
| `framework` | string | No | Framework identifier (optional) |
| `type` | string | No | Type hint |
| `dependencies` | string[] | No | Additional npm packages |
| `assets` | [from, to][] | No | Asset copy mappings |
| `extraRules` | string[] | No | LLM instructions |

---

## Framework Identifiers

**Frontend:**
- `nextjs` - Next.js (React)
- `vite-react` - Vite + React
- `remix` - Remix
- `vue` - Vue.js
- `svelte` - Svelte

**Backend:**
- `express` - Express.js
- `fastify` - Fastify
- `nestjs` - NestJS

**Mobile:**
- `react-native` - React Native
- `flutter` - Flutter

**Other:**
- `rust` - Rust
- `go` - Go
- `python` - Python

---

## Language Identifiers

**Required values:**
- `typescript`
- `javascript`
- `python`
- `rust`
- `go`
- `dart` (for Flutter)
- `swift` (for iOS)
- `kotlin` (for Android)

---

## Optional Target Fields

### Dependencies

Array of npm package names to install:

```json
{
  "dependencies": [
    "react-query",
    "zustand",
    "@radix-ui/react-dialog"
  ]
}
```

**Use for:**
- UI libraries
- State management
- Form validation
- Date/time utilities

---

### Assets

Array of `[source, destination]` pairs for copying static files:

```json
{
  "assets": [
    ["assets/logo.svg", "public/logo.svg"],
    ["assets/favicon.ico", "public/favicon.ico"],
    ["assets/images", "public/images"]
  ]
}
```

**Format:** `[from, to]`
- **from** (index 0): Source path (relative to project root)
- **to** (index 1): Destination path (relative to target output)

**Examples:**

```json
// Copy single file
["assets/logo.svg", "public/logo.svg"]

// Copy entire directory
["assets/images", "public/images"]

// Copy with different name
["assets/app-icon.png", "public/icon.png"]
```

---

### Extra Rules

Array of additional LLM instructions specific to this target:

```json
{
  "extraRules": [
    "Use React Server Components where possible",
    "Implement dark mode with next-themes",
    "All forms must use react-hook-form with zod validation",
    "Add proper ARIA labels for accessibility"
  ]
}
```

**Use for:**
- Framework-specific patterns
- Performance optimizations
- Security requirements
- Accessibility rules
- Custom conventions

---

## Global Configuration

Optional global settings:

```json
{
  "global": {
    "packageManager": "npm",      // "npm" | "yarn" | "pnpm"
    "nodeVersion": "20",          // Node.js version
    "moduleSystem": "esm"         // "esm" | "commonjs"
  }
}
```

---

## Complete Example

```json
{
  "name": "saas-platform",
  "version": "1.0.0",
  "description": "Multi-tenant SaaS platform",
  
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "apiKey": "${GEMINI_API_KEY}",
    "temperature": 0.2,
    "maxTokens": 8192
  },
  
  "targets": {
    "web": {
      "entry": "./src/frontend/app.compose",
      "framework": "nextjs",
      "language": "typescript",
      "output": "./generated/web",
      "type": "react",
      
      "dependencies": [
        "@tanstack/react-query",
        "zustand",
        "@radix-ui/react-dialog",
        "recharts"
      ],
      
      "assets": [
        ["assets/logo.svg", "public/logo.svg"],
        ["assets/favicon.ico", "public/favicon.ico"],
        ["assets/images", "public/images"]
      ],
      
      "extraRules": [
        "Use React Server Components for data fetching",
        "Implement dark mode with next-themes",
        "All forms use react-hook-form with zod validation"
      ]
    },
    
    "api": {
      "entry": "./src/backend/api.compose",
      "framework": "express",
      "language": "typescript",
      "output": "./generated/api",
      "type": "node",
      
      "dependencies": [
        "prisma",
        "@prisma/client",
        "zod",
        "bcrypt",
        "jsonwebtoken"
      ],
      
      "extraRules": [
        "Use Prisma for database access",
        "Implement JWT authentication",
        "Add rate limiting to all endpoints"
      ]
    }
  },
  
  "global": {
    "packageManager": "npm",
    "nodeVersion": "20",
    "moduleSystem": "esm"
  }
}
```

---

## Minimal Example

```json
{
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "apiKey": "${GEMINI_API_KEY}"
  },
  
  "targets": {
    "web": {
      "entry": "./app.compose",
      "framework": "nextjs",
      "language": "typescript",
      "output": "./generated/web"
    }
  }
}
```

---

## Validation Rules

The compiler validates:

1. ✅ **llm block exists** - Must have LLM configuration
2. ✅ **At least one target** - Must define at least one target
3. ✅ **Required target fields** - entry, framework, language, output
4. ✅ **Valid provider** - Must be gemini, openai, or anthropic
5. ✅ **Unique output paths** - No two targets can have same output directory
6. ✅ **Entry file exists** - Entry .compose file must exist
7. ✅ **Valid language** - Must be a supported language identifier

---

## Error Examples

### Missing required field

```json
// ❌ Error: Missing language
{
  "targets": {
    "web": {
      "entry": "./app.compose",
      "framework": "nextjs",
      // Missing: "language": "typescript"
      "output": "./generated/web"
    }
  }
}
```

### No targets defined

```json
// ❌ Error: No targets
{
  "llm": { ... },
  "targets": {}  // Must have at least one target
}
```

### Invalid provider

```json
// ❌ Error: Invalid provider
{
  "llm": {
    "provider": "chatgpt",  // Invalid! Use "openai"
    "model": "gpt-4"
  }
}
```

---

## Migration from Old Format

**Old format:**
```json
{
  "targets": {
    "web": {
      "framework": "nextjs",
      "output": "./web"
    }
  },
  "llm": { ... }
}
```

**New format (required fields added):**
```json
{
  "llm": { ... },
  "targets": {
    "web": {
      "entry": "./app.compose",     // ← Added
      "framework": "nextjs",
      "language": "typescript",      // ← Added
      "output": "./generated/web"
    }
  }
}
```

---

## Summary

**Required structure:**
```
compose.json
├── llm (required)
│   ├── provider (required)
│   ├── model (required)
│   └── apiKey (required)
└── targets (required, at least one)
    └── [target-name]
        ├── entry (required)
        ├── framework (required)
        ├── language (required)
        └── output (required)
```

**Optional additions:**
- `dependencies` - npm packages
- `assets` - file copying (`[from, to]` pairs)
- `extraRules` - LLM instructions
- `global` - global settings

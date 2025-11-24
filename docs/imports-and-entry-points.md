# Imports and Entry Points

## Using Imports

Import models and definitions from other `.compose` files:

```compose
import "models/user.compose"
import "features/auth.compose"
```

---

## Entry Points (Required with Imports!)

**When you use `import` statements, you MUST specify an `entry` point in `compose.json`.**

### Why?

The compiler needs to know:
- Where to start compilation
- How to resolve import paths
- Which files to include

### Example

**Project structure:**
```
project/
├── compose.json
├── app.compose          # ← Entry point
├── models/
│   └── user.compose
└── features/
    └── auth.compose
```

**app.compose:**
```compose
import "models/user.compose"
import "features/auth.compose"

# Use imported models
feature "Dashboard":
  - Show user info from User model
```

**compose.json:**
```json
{
  "targets": {
    "web": {
      "entry": "./app.compose",   // ← REQUIRED!
      "framework": "nextjs"
    }
  }
}
```

---

## Multi-Target Entry Points

Different targets can have different entry points:

```json
{
  "targets": {
    "web": {
      "entry": "./src/frontend/app.compose",
      "framework": "nextjs"
    },
    "api": {
      "entry": "./src/backend/api.compose",
      "framework": "express"
    }
  }
}
```

---

## Import Rules

1. **Paths are relative** to project root or entry point
2. **Extension optional** - `"models/user"` works (but `.compose` is clearer)
3. **No circular imports** - File A can't import file B if B imports A
4. **Import order doesn't matter** - Compiler resolves dependencies

---

## Common Patterns

### Pattern 1: Shared Models

```
project/
├── app.compose             # Entry (imports shared)
├── shared/
│   ├── user.compose
│   └── product.compose
└── features/
    └── checkout.compose    # Also imports shared
```

### Pattern 2: Feature Modules

```
project/
├── app.compose             # Entry (imports all features)
├── features/
│   ├── auth.compose
│   ├── dashboard.compose
│   └── settings.compose
```

### Pattern 3: Multi-Target Shared

```
project/
├── shared/
│   └── types.compose       # Shared across targets
├── frontend/
│   └── app.compose         # Entry for web (imports shared)
└── backend/
    └── api.compose         # Entry for API (imports shared)
```

---

## Error: Missing Entry Point

If you see this error:
```
Error: No entry point specified for target 'web'
```

**Fix:** Add `entry` to your target in `compose.json`:

```json
{
  "targets": {
    "web": {
      "entry": "./app.compose",  // ← Add this
      "framework": "nextjs"
    }
  }
}
```

---

## Summary

- ✅ **Single file:** Entry point optional
- ⚠️ **With imports:** Entry point REQUIRED
- 📁 **Entry point:** Where compilation starts
- 🔗 **Imports:** Resolved from entry point outward

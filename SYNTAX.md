# Compose Syntax Reference

## Philosophy

Compose is a **minimal architecture specification language** with just two keywords:
- `model` - Define your data structures
- `feature` - Describe what your app does

Everything else is plain English descriptions that the LLM compiler understands.

---

## The Two Keywords

### `model` - Data Structures

```compose
model User:
  email: text (unique)
  name: text
  avatar: image
  role: "admin" | "member" | "guest"
  createdAt: timestamp

model Todo:
  title: text
  completed: bool
  dueDate: date?
  assignee: User?
```

**Types:**
- `text`, `number`, `bool`, `date`, `timestamp`
- `image`, `file`, `json`
- `list of X`, `X[]`
- `"literal" | "union"` for enums
- `X?` for optional fields
- `(unique)`, `(required)` for constraints

---

### `feature` - Everything Else

```compose
feature "Authentication":
  - Email/password signup
  - Social login (Google, GitHub)
  - Password reset via email
  - 2FA support

feature "Task Management":
  - Create tasks with title, description, due date
  - Assign to team members
  - Mark as complete
  - Delete tasks

feature "Theme":
  - Modern, clean aesthetic
  - Blue/indigo color scheme
  - Dark mode support
  - Card-based layout
```

**Use `feature` for:**
- User-facing functionality
- Visual design/themes
- Business rules
- Workflows
- Integrations
- Anything the app does

---

## File Organization

### `.compose` Files - Business Logic

```
src/
  app.compose           # Main application
  models/
    user.compose        # User model
    project.compose     # Project model
  features/
    auth.compose        # Authentication features
    tasks.compose       # Task features
```

**Contains:**
- Data models
- Feature descriptions
- Business requirements

**Does NOT contain:**
- Framework choices
- Infrastructure decisions
- Deployment config

---

### `compose.json` - Technical Decisions

```json
{
  "architecture": {
    "pattern": "clean-architecture",
    "principles": ["DDD", "repository-pattern"]
  },
  "targets": {
    "web": {
      "framework": "nextjs",
      "styling": "tailwindcss"
    },
    "api": {
      "framework": "nestjs",
      "database": "postgresql"
    }
  }
}
```

**Contains:**
- Framework choices
- Architecture patterns
- Infrastructure (database, cache, etc.)
- Deployment configuration
- LLM settings

---

## Complete Example

### `app.compose`
```compose
# ══════════════════════════════════════
# MODELS
# ══════════════════════════════════════

model User:
  email: text (unique)
  name: text
  role: "admin" | "member"

model Todo:
  title: text
  completed: bool
  owner: User

# ══════════════════════════════════════
# FEATURES
# ══════════════════════════════════════

feature "User Management":
  - Sign up with email
  - Login with password
  - Manage profile

feature "Todo Management":
  - Create todos
  - Mark as complete
  - Delete todos
  - Filter by status

feature "Theme":
  - Clean, modern design
  - Blue color scheme
  - Dark mode toggle
```

### `compose.json`
```json
{
  "name": "TodoApp",
  "targets": {
    "web": {
      "framework": "nextjs",
      "language": "typescript"
    },
    "api": {
      "framework": "express",
      "database": "postgresql"
    }
  },
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
}
```

---

## Multi-Target Generation

Same `.compose` files + different `compose.json` = different outputs:

```bash
# Web app
compose build --target web

# Mobile app
compose build --target mobile

# All targets
compose build
```

---

## What Compose Is

✅ **Architecture specification language**
✅ **Declarative** (what, not how)
✅ **Framework-agnostic** (compiles to anything)
✅ **Minimal syntax** (two keywords)

❌ **NOT a programming language** (no algorithms)
❌ **NOT a framework** (no runtime)
❌ **NOT code** (no implementation details)

---

**You describe architecture. The LLM builds the code.**

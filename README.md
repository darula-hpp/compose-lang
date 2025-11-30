# Compose-Lang

> **LLM-Aware Build System** — Version-controlled architecture that compiles to production code.

Compose is a build system for LLM-generated code with dependency tracking, export maps, and reproducible builds via caching. Define your application architecture in structured specs (`.compose` files), and generate framework-specific code through LLM compilation.

**At its core:** An Intermediate Representation (IR) system that enables semantic validation, dependency analysis, and intelligent code generation. The `.compose` DSL is one way to create this IR—we're building support for OpenAPI, GraphQL, and existing codebases too.

## How It Works

**Traditional Development:**
- Write code → Review code → Version control code
- Architecture lives in docs (which drift from reality)
- Teams struggle to understand big codebases

**With Compose:**
- Write architecture specs → LLM generates code → Version control both
- Architecture IS the code generator (can't drift)
- Read 50-line `.compose` file instead of 50-file codebase
- **Reproducible** — Caching ensures same input = same output
- **Framework-agnostic** — Regenerate for different targets
- **Incremental** — Export maps enable smart regeneration (not everything)

## Quick Example

## Three Keywords. That's It.

```compose
# 1. model - Data structures
model User:
  email: text
  role: "admin" | "member"

# 2. feature - What users can do  
feature "Authentication":
  - Email/password signup
  - Password reset

# 3. guide - Implementation details (added as you develop)
guide "Security":
  - Rate limit login: 5 attempts per 15 min
  - Use bcrypt cost factor 12
  - Store sessions in Redis
```

**That's the entire language.** No classes, no functions, no syntax complexity.

---

## Key Features

✅ **Structured DSL** — Three keywords: `model`, `feature`, `guide`  
✅ **Export Maps** — Track all exported symbols for intelligent incremental generation  
✅ **LLM Caching** — Reproducible builds via cached responses (commit cache to git)  
✅ **Dependency Tracking** — Regenerate only affected files when specs change  
✅ **@ References** — Link to external code; LLM translates to target language  
✅ **Multi-Target** — Same spec → Next.js, React, Vue (more coming)  
✅ **Framework-Agnostic IR** — Core system works with any input format  
✅ **Version Controlled** — Architecture specs in git, not ad-hoc prompts

---

## ⚠️ Limitations & When NOT to Use

**This is v0.2.0 — here's what's NOT solved yet:**

### Current Gaps
- ❌ **Drift detection** — No automated validation that new code correctly uses existing exports
- ❌ **Model version pinning** — LLM provider updates can break reproducibility  
- ❌ **Complex domain logic** — LLMs struggle with intricate business rules  
- ❌ **Instruction limits** — Sweet spot is ~10-20 guides per file; beyond that, quality degrades  
- ❌ **Perfect determinism** — Cache provides reproducibility, but LLMs are probabilistic  

### When to Use Something Else

**Use Cursor/Copilot instead if:**
- Quick one-off scripts or prototypes
- You're solo and not maintaining long-term
- Exploring ideas rapidly

**Write code manually if:**
- Complex algorithmic logic
- Mission-critical systems (banking, healthcare, flight control)
- Edge-case-heavy domains
- You need 100% control over every line

**Compose is best for:**
- ✅ Multi-developer teams maintaining apps over time
- ✅ CRUD apps, internal tools, MVPs
- ✅ Iterative development (adding features incrementally)
- ✅ Framework migrations (regenerate for new tech stack)
- ✅ Architecture documentation that can't go stale

---

## 📊 Comparison

| Tool | Reproducibility | Version Control | Team Collab | Incremental Gen | Framework Agnostic |
|------|----------------|-----------------|-------------|-----------------|--------------------|
| **ChatGPT** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Cursor/Copilot** | ❌ | Partial | ✅ | ❌ | ✅ |
| **Compose** | ✅ (via cache) | ✅ | ✅ | ✅ | ✅ |
| **Manual Coding** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Trade-off:** Compose adds structure (DSL + tooling) in exchange for reproducibility and team collaboration. If you don't need those, simpler tools are better.

---

## 🚀 Installation

```bash
git clone https://github.com/darula-hpp/compose-lang.git
cd compose-lang
npm install
npm link
```

### Create Your First Project

```bash
compose init
# Choose: Vite + React, Express
# Include example files: Yes

cd my-compose-app
compose build
```

### Run the Generated Apps

```bash
# Frontend
cd generated/frontend
npm install
npm run dev

# Backend (separate terminal)
cd generated/backend
npm install
npm run dev
```

---

## 📝 The Compose Language

### Data Structures
```compose
define structure Todo
  has id as number
  has title as text
  has completed as boolean
```

### Frontend - Pages & Components
```compose
frontend.page "Dashboard"
  description: "Admin dashboard with charts and tables"

frontend.component "TodoForm"
  description: "Form to add new todo items"
  accepts todo as Todo
```

### Backend - APIs
```compose
backend.create-api "CreateTodo"
  description: "Create a new todo item"
  accepts title as text
  returns Todo

backend.create-api "GetTodos"
  description: "Get all todos"
  returns list of Todo
```

### Multi-File Projects
```compose
// src/types/todo.compose
define structure Todo
  has id as number
  has title as text

// src/backend/api.compose
import "../types/todo.compose"

backend.create-api "GetTodos"
  returns list of Todo
```

See [Language Specification](language/semantics.md) for full syntax.

---

## 🛠️ CLI Commands

### `compose init`
Initialize a new project with framework scaffolding

```bash
compose init
# Prompts for:
#  - Project name
#  - Frontend framework (Vite, Next.js, Remix, Skip)
#  - Backend framework (Express, Fastify, Skip)
#  - Include example .compose files? (Y/n)
```

### `compose build`
Compile .compose files to target code

```bash
compose build
# Detects framework in generated/
# Generates code with LLM
# Merges intelligently into framework structure
```

**Result:** Production-ready Next.js app in `./generated/web/`

---

## Advanced Features

### Reference Code (@ Operator)

For complex business logic, write it in any language and reference it:

```python
# reference/pricing.py (easy to read, test, audit)
def calculate_discount(user_tier, amount):
    discounts = {'bronze': 0.05, 'silver': 0.10, 'gold': 0.15}
    return amount * discounts.get(user_tier, 0)
```

```compose
# app.compose
guide "Pricing Logic":
  - Reference: @reference/pricing.py::calculate_discount
  - LLM translates to target language
  - Preserves exact business rules
```

**Same logic works for TypeScript, Rust, Go, Swift** — LLM translates!

### Static Assets

```
my-app/
├── assets/          # Framework-agnostic
│   ├── logo.svg
│   └── images/
└── generated/
    └── web/
        └── public/  # Assets copied here
```

**Assets automatically copied to framework output during build.**

---

## Philosophy: Vibe Engineering

**Traditional development:**
```
Senior Dev → Writes React code
           → Reviews PRs
           → Fixes bugs in generated code
```

**With Compose:**
```
Senior Dev → Writes .compose files
           → Reviews architecture specs
           → Fixes bugs by updating guides
```

**The shift:** From implementation → architecture. From code review → spec review.

### Your Cursor Workflow, Codified

Compose takes your typical Cursor/AI agent workflow and makes it reproducible:

```
Cursor Workflow:
You: "Add authentication"
AI: *generates code*
You: "Make it secure"  
AI: *adds rate limiting*
You: "Handle edge case"
AI: *updates code*
```

```compose
Compose (Same Vibe, Reproducible):
feature "Authentication"

guide "Security":
  - Rate limit to 5 attempts per 15 min
  
guide "Edge Cases":
  - Handle expired tokens
  - Refresh on 401
```

**The .compose file IS the conversation history.** Rebuild anytime, same result.

---

## Project Structure

```
my-app/
├── app.compose       # Architecture spec (source of truth)
├── compose.json      # Framework/deployment config
├── reference/        # Business logic (Python, SQL, etc.)
│   └── pricing.py
├── assets/           # Static files (logos, images)
└── generated/        # LLM-generated code (don't edit!)
    ├── web/          # Next.js app
    └── mobile/       # React Native app
```

**Important:** If using `import` statements, specify `entry` in `compose.json`:

```json
{
  "targets": {
    "web": {
      "entry": "./app.compose",  // Required with imports
      "framework": "nextjs"
    }
  }
}
```

### `compose dev`
Watch mode with automatic rebuilds

```bash
## Features

✅ **Three Keywords** — `model` (data), `feature` (behavior), `guide` (implementation). That's the entire language.  
✅ **@ References** — Link to external code in any language; LLM translates to your target  
✅ **Multi-Target** — Generate web, mobile, and API from one specification  
✅ **Plain English** — Describe features naturally, LLM handles implementation  
✅ **Framework-Agnostic** — Regenerate for Next.js, Vue, Svelte anytime  
✅ **Deterministic** — Cached LLM responses ensure reproducible builds  
✅ **Version Controlled** — Track architectural changes in Git    

---

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/darula-hpp/compose-lang.git
cd compose-lang
npm install
npm link
```

### Create Your First App

```bash
# Initialize project
compose init
# Choose frameworks and include examples

# Build
cd my-project
compose build

# Run generated code
cd generated/web
npm install
npm run dev
```

### Or Start from Scratch

**1. Create `app.compose`:**
```compose
model User:
  name: text
  email: text (unique)

model Post:
  title: text
  content: markdown
  author: User

feature "User Management":
  - Sign up with email
  - Login
  - View profile

feature "Blog":
  - Create posts with markdown
  - List all posts
  - View single post

feature "Theme":
  - Modern, clean design
  - Purple/pink gradient colors

# Add guides as you develop
guide "Performance":
  - Cache blog posts for 10 minutes
  - Use static generation for post pages
```

**2. Create `compose.json`:**
```json
{
  "targets": {
    "web": {
      "framework": "nextjs",
      "styling": "tailwindcss",
      "output": "./web"
    },
    "api": {
      "framework": "express",
      "database": "postgresql",
      "output": "./api"
    }
  },
  "llm": {
    "provider": "gemini",
    "apiKey": "${GEMINI_API_KEY}"
  }
}
```

**3. Build:**
```bash
export GEMINI_API_KEY="your-key"
compose build
```
Useful for:
- Fresh rebuild
- Troubleshooting build issues
- Freeing disk space

---

## ⚙️ Configuration

Create `compose.json` in your project root:

```json
{
  "llm": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "apiKey": "${GEMINI_API_KEY}",
    "temperature": 0.2,
    "maxTokens": 8192
  },
  "targets": {
    "frontend": {
      "entry": "./src/frontend/app.compose",
      "type": "react",
      "framework": "vite",
      "output": "./generated/frontend"
    },
    "backend": {
      "entry": "./src/backend/api.compose",
      "type": "node",
      "framework": "express",
      "output": "./generated/backend"
    }
  }
}
```

### Supported LLM Providers
- **Gemini** (Google) - Recommended, fast and cheap
- **OpenAI** (GPT-4, GPT-4o)
- **Anthropic** (Coming soon)
- **Local models** (Planned)

Set your API key:
```bash
export GEMINI_API_KEY="your-api-key"
# or
export OPENAI_API_KEY="your-api-key"
```

### Supported Frameworks

**Frontend:**
- Vite + React ✅
- Next.js ✅
- Remix ✅
- Astro (Planned)
- SolidJS (Planned)

**Backend:**
- Express ✅
- Fastify (Planned)
- NestJS (Planned)
- Hono (Planned)

---

## 🎯 How It Works

### 1. Write Architecture
```compose
frontend.page "Home"
  description: "Todo app with CRUD operations"
```

### 2. Compile to IR
```
Lexer → Parser → Analyzer → Intermediate Representation
```

### 3. Generate Code (LLM)
```
IR + Framework Context → LLM → Production Code
```

### 4. Merge Intelligently
```
Framework Detection → Injection Strategy → Merged Output
```

**Result:** Complete, runnable applications with proper framework structure.

---

## 🔥 Key Features

### LLM Response Caching
Same input always produces same output. Builds are deterministic and fast.

```bash
# First build: calls LLM
compose build  # 10 seconds

# Second build: uses cache
compose build  # 0.5 seconds
```

### Framework-Agnostic Init
Delegates to official tools instead of maintaining templates:

```bash
compose init
# Runs: npm create vite@latest
# Then: merges your generated code in
```

No outdated templates. Always fresh scaffolding.

### Intelligent Code Merging
Compose understands framework conventions:

- **Vite**: Injects routes into `App.jsx`
- **Next.js**: Uses file-based routing
- **Express**: Registers routes in `server.js`

### Multi-File Projects
```
src/
├── types/
│   └── todo.compose
├── frontend/
│   └── app.compose
└── backend/
    └── api.compose
```

Import and modularize your architecture.

---

## 🚀 Roadmap

See [ROADMAP.md](ROADMAP.md) for the full vision.

### Near Term (2025)
- VS Code extension
- More framework adapters
- Testing support
- Type generation

### Game Changer (2026)
- **Compose Ingest** - Reverse compiler that turns existing code into `.compose` files
- Legacy modernization tool
- Cross-platform migration
- Architecture documentation

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

**Good first issues:**
- Add framework adapters
- Improve error messages
- Add examples
- Write documentation

---

## 📚 Documentation

- **[SYNTAX.md](SYNTAX.md)** - Complete language reference
- **[docs/reference-code.md](docs/reference-code.md)** - Using @ operator and reference code
- **[docs/compose-json.md](docs/compose-json.md)** - Configuration options
- **[examples/](examples/)** - Real-world examples
  - `todo-simple/` - Minimal example
  - `projectflow/` - Complex SaaS app
  - `ecommerce-with-reference/` - Shows @ operator usage
  - `payment-system-evolution.md` - How guides grow over time
- [LLM Integration](docs/llm-integration.md)
- [Compose Ingest (Future)](docs/compose-ingest.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Project Roadmap](ROADMAP.md)

---

## 🌟 Philosophy

Compose is:
- **Prompt-first** - The `.compose` file is your source of truth
- **Framework-agnostic** - One description, many targets
- **LLM-native** - Built for the AI era
- **Developer-friendly** - Natural language with structure

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

**Built with ❤️ for the AI-native future of software development**

[GitHub](https://github.com/darula-hpp/compose-lang) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md)

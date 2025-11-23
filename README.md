# Compose-Lang

**Write architecture in English. Get production code.**

Compose-Lang is a revolutionary **architecture definition language** that lets you describe applications in natural, structured English and generate real, runnable code for any tech stack using LLMs.

```compose
frontend.page "Home"
  description: "A todo app with add, complete, and delete"
  
backend.create-api "GetTodos"
  description: "Fetch all todo items"
  returns list of Todo
```

**→ Generates complete React + Express apps with one command**

---

## ✨ Why Compose?

### The Problem
Traditional code generation is brittle and opinionated. You get locked into specific frameworks, patterns, and outdated templates.

### The Solution
Compose is **framework-agnostic**. Describe your architecture once, generate for any stack:
- Want Vite today, Next.js tomorrow? ✅
- Need to port web app to mobile? ✅
- Migrate Java monolith to Node.js? ✅ ([Compose Ingest](docs/compose-ingest.md))

### Key Benefits
- 🎯 **Natural language** - Write architecture in structured English
- 🤖 **LLM-powered** - Leverages GPT-4, Gemini, Claude for code generation
- 🔄 **Deterministic** - Caching ensures same input = same output
- 🚀 **Framework-agnostic** - Works with Vite, Next.js, Express, and more
- 📦 **Official scaffolding** - Uses `create-vite`, `create-next-app`, etc.
- 🧩 **Modular** - Multi-file projects with imports

---

## 🚀 Quick Start

### Installation

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

### `compose dev`
Watch mode with automatic rebuilds

```bash
compose dev
# Watches .compose files
# Rebuilds on changes
```

### `compose run [target]`
Start generated applications

```bash
compose run frontend  # Start Vite dev server
compose run backend   # Start Express server
```

### `compose eject`
Graduate from Compose and take full ownership

```bash
compose eject
# Copies generated/ → permanent locations (frontend/, backend/)
# Archives .compose files
# Removes Compose configuration
# You maintain code manually from here
```

⚠️ **Warning:** Eject is permanent. You can't use `compose build` after ejecting.

### `compose clean`
Remove generated code and build cache

```bash
compose clean
# Removes:
#  - generated/ directory (or target-specific output dirs)
#  - .compose/ cache
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

- [Language Specification](language/semantics.md)
- [Grammar Reference](language/grammar.ebnf)
- [Architecture Overview](language/architecture.md)
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

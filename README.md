# Compose-Lang

**Define architecture. AI builds the code.**

Compose is an **architecture specification language** with just two keywords: `model` and `feature`. Describe what you want in plain English, and an LLM compiler generates production code for any framework.

## Why Compose?

- **Minimal** — Two keywords: `model` (data) and `feature` (behavior)
- **Multi-target** — One spec → React, Next.js, Vue, Express, React Native, etc.
- **Framework-agnostic** — No lock-in. Regenerate for new frameworks anytime.
- **Deterministic** — Cached builds ensure reproducibility
- **Team-friendly** — Version control architecture, not implementation

## Quick Example

### `app.compose` - Your Architecture
```compose
# Data
model Todo:
  title: text
  completed: bool
  dueDate: date?

# Features  
feature "Todo Management":
  - Create todos
  - Mark as complete
  - Delete todos

feature "Theme":
  - Clean, modern design
  - Blue color scheme
```

### `compose.json` - Technical Decisions
```json
{
  "targets": {
    "web": { "framework": "nextjs" },
    "mobile": { "framework": "react-native" },
    "api": { "framework": "express" }
  }
}
```

### Build
```bash
compose build
# Generates Next.js, React Native, and Express from the same spec
```

**→ Complete, runnable applications**? ✅ ([Compose Ingest](docs/compose-ingest.md))

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
## Features

✅ **Two Keywords** — `model` (data) and `feature` (behavior). That's the whole language.  
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

# Compose Language

**An English-based, structured programming language designed for LLM-assisted code generation.**

Compose is not a conventional programming language — it's a **high-level, deterministic instruction layer** that describes application intent in structured English. An LLM compiler translates Compose code into real source code for multiple targets (React, Node.js, Python, Django, mobile, etc.).

## Why Compose?

- **Human-readable but structured** — Natural English with enforced syntax for predictable parsing
- **LLM-native** — Designed specifically for AI-assisted code generation
- **Unopinionated** — Describes *what* your app does, not *how* to build it
- **Target-agnostic** — One `.compose` file → multiple output formats
- **Modular** — Incremental compilation for fast iteration

## Quick Example

```compose
define structure Customer
  has id as number
  has name as text
  has email as text

frontend.page "Dashboard"
  is protected
  description: "Shows customer metrics and analytics"

backend.create_api "GetCustomer"
  description: "Fetch a single customer by ID"

define function calculateRevenue
  inputs: sales as list of Sale
  returns: number
  description: "Sum all sale amounts and return total revenue"
```

## Features

✅ **Data Structures** — Define types, variables, and arrays  
✅ **Frontend DSL** — Pages, components, state, themes, rendering  
✅ **Backend DSL** — APIs, queries, file I/O, environment variables, sockets  
✅ **Pure English Functions** — Describe behavior without writing code  
✅ **Multi-file Projects** — Import and modularize your application  
✅ **Context Comments** — Guide the LLM with additional context  
✅ **Target Configuration** — Control output via `targets.json`

## Project Structure

```
compose-lang/
├── compiler/           # Lexer, parser, IR, code emitter
├── runtime/            # Runtime libraries (JS, Node, WASM)
├── stdlib/             # Built-in packages (UI, data, fs, net)
├── cli/                # The `compose` CLI tool
├── language/           # Language specification & grammar
├── playground/         # Online playground
├── examples/           # Example Compose projects
├── docs/               # Documentation site
└── packages/           # VS Code extension, formatters, etc.
```

## Getting Started

### Installation

```bash
npm install -g compose-lang
```

### Create a New Project

```bash
compose new my-app
cd my-app
```

### Build Your App

```bash
compose build
```

### Development Mode

```bash
compose dev
```

## Documentation

- [Language Specification](./language/semantics.md)
- [Grammar Reference](./language/grammar.ebnf)
- [Architecture Overview](./language/architecture.md)
- [Token Reference](./language/tokens.md)

## Examples

Explore real-world Compose applications:

- [Todo App](./examples/todo-app/)
- [Airline Booking System](./examples/airline-booking/)
- [Real-time Chat](./examples/realtime-chat/)
- [E-commerce Platform](./examples/ecommerce/)

## Targets

Compose can compile to:

- **Frontend**: React, Vue, Svelte, vanilla JS
- **Backend**: Node.js, Python (Django/Flask), Rust
- **Mobile**: React Native (planned)
- **Desktop**: Electron (planned)

Configure targets in `targets.json`:

```json
{
  "targets": {
    "frontend": {
      "type": "react",
      "output": "./generated/frontend"
    },
    "backend": {
      "type": "node",
      "output": "./generated/backend"
    }
  }
}
```

## Philosophy

Compose is designed for:

- Developers who want to prototype faster
- Non-developers building real applications
- AI-first builders leveraging LLM capabilities
- Teams building internal tools at scale

## Roadmap

**v1.0** (Current)
- ✅ Core language features
- ✅ Frontend & backend DSLs
- ✅ Multi-file projects
- ✅ IR generation

**Future**
- OOP (classes, inheritance, methods)
- Async workflows
- Built-in auth macros
- Plugin system
- Compose Studio (GUI composer)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License — See [LICENSE](./LICENSE) for details.

---

Built with ❤️ for the LLM-native future of software development.

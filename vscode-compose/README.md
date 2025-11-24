# Compose Language Support for VS Code

> **Vibe Engineering Language** — Syntax highlighting, snippets, and build integration for Compose.

## Features

✅ **Syntax Highlighting** - Keywords, types, strings, comments, @ operator  
✅ **Code Snippets** - Quick templates for `model`, `feature`, `guide`  
✅ **Build Commands** - Run `compose build` from VS Code  
✅ **File Icons** - Custom icon for `.compose` files  

---

## Usage

### Snippets

Type these prefixes and press `Tab`:

- `model` → Create model template
- `feature` → Create feature template
- `guide` → Create guide template
- `compose-app` → Complete app template

### Commands

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux):

- **Compose: Build** - Build your project
- **Compose: Build (Watch Mode)** - Watch for changes
- **Compose: Create New Project** - Initialize new project

---

## Example

```compose
# Quick example using snippets

model User:
  email: text
  role: "admin" | "member"

feature "Authentication":
  - Email/password login
  - Session management

guide "Security":
  - Use bcrypt cost factor 12
  - Rate limit: 5 attempts per 15 min
```

---

## Requirements

- [Compose](https://github.com/compose-lang/compose) CLI installed
- Node.js 18+ (for running builds)

---

## Extension Settings

This extension contributes these settings:

- `compose.buildOnSave` - Automatically build on save (default: `false`)
- `compose.validateOnType` - Show validation while typing (default: `true`)
- `compose.formatter.indentSize` - Indentation size (default: `2`)

---

## Release Notes

### 0.1.0 (Initial Release)

- Syntax highlighting for `.compose` files
- Code snippets for model, feature, guide
- Build command integration
- Custom file icon

---

## Contributing

Found a bug or want a feature? [Open an issue](https://github.com/compose-lang/vscode-compose/issues)!

---

## License

MIT

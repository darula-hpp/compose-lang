# Contributing to Compose-Lang

Thank you for your interest in contributing to Compose-Lang! This guide will help you get started.

## 🎯 Vision

Compose-Lang is building the **universal architecture definition language** - a way to describe modern applications in natural language and generate production-ready code for any tech stack.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Git
- A Gemini API key (for testing LLM features)

### Setup
```bash
git clone https://github.com/darula-hpp/compose-lang.git
cd compose-lang
npm install
npm link  # Make 'compose' command available globally
```

### Test Your Setup
```bash
cd demo
export GEMINI_API_KEY="your-api-key"
compose build
```

## 🛠️ Project Structure

```
compose-lang/
├── cli/              # Command-line interface
│   └── commands/     # Individual commands (init, build, dev)
├── compiler/
│   ├── lexer/        # Tokenization
│   ├── parser/       # AST generation
│   ├── analyzer/     # Semantic analysis
│   ├── ir/           # Intermediate representation
│   ├── emitter/      # Code generation
│   └── loader/       # Module loading
├── language/         # Language specification
├── tests/            # Test suite
└── docs/             # Documentation
```

## 🎨 How to Contribute

### 1. Add a New Framework Adapter

**Example: Adding Fastify Support**

1. **Update Framework Analyzer** (`compiler/emitter/framework-analyzer.js`):
```javascript
// Detect Fastify
if (pkg.dependencies?.fastify) {
  return {
    type: 'node',
    framework: 'fastify',
    routing: 'explicit',
    routesDir: 'routes',
    entryPoint: 'server.js'
  };
}
```

2. **Add Merge Strategy** (`compiler/emitter/code-merger.js`):
```javascript
case 'fastify':
  return mergeFastifyCode(generatedFiles, frameworkInfo, targetDir);
```

3. **Test It**:
```bash
npm test -- tests/compiler/framework-analyzer.test.js
```

### 2. Add Language Features

**Example: Adding `frontend.form` Support**

1. **Update Tokens** (`compiler/lexer/token-types.js`):
```javascript
FRONTEND_FORM: 'FRONTEND_FORM',
```

2. **Update Keywords**:
```javascript
'frontend.form': TokenType.FRONTEND_FORM,
```

3. **Update Parser** (`compiler/parser/parser.js`):
```javascript
case TokenType.FRONTEND_FORM:
  return this.parseFrontendForm();
```

4. **Update IR Builder** (`compiler/ir/ir-builder.js`):
```javascript
visitFrontendForm(node) {
  // Convert to IR
}
```

5. **Document It** (`language/semantics.md`)

### 3. Add LLM Provider

**Example: Adding Anthropic Claude**

1. **Create Client** (`compiler/emitter/anthropic-client.js`):
```javascript
export class AnthropicClient {
  constructor(config, cacheManager) {
    // Initialize Anthropic SDK
  }

  async generate(systemPrompt, userPrompt, options) {
    // Call Claude API
  }
}
```

2. **Register in Factory** (`compiler/emitter/llm-client.js`):
```javascript
case 'anthropic': {
  const { AnthropicClient } = await import('./anthropic-client.js');
  return new AnthropicClient(config, cacheManager);
}
```

3. **Update Docs** (`docs/llm-integration.md`)

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- tests/compiler/parser.test.js
```

### Add a New Test
```javascript
describe('MyNewFeature', () => {
  it('should parse correctly', () => {
    const source = 'frontend.form "Login"';
    const result = compile(source);
    expect(result.success).toBe(true);
  });
});
```

## 📝 Documentation

- Update `README.md` for user-facing changes
- Update `language/semantics.md` for syntax changes
- Add examples to `examples/` directory
- Update `CHANGELOG.md`

## 🐛 Reporting Issues

Use GitHub Issues with these labels:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Great for newcomers

## 💡 Good First Issues

Looking for a place to start? Try these:

### Easy
- [ ] Add syntax highlighting for VS Code
- [ ] Improve error messages
- [ ] Add more examples to `examples/`
- [ ] Fix typos in documentation

### Medium
- [ ] Add SolidJS framework support
- [ ] Add Anthropic Claude LLM provider
- [ ] Implement `frontend.modal` component type
- [ ] Add prettier plugin for `.compose` files

### Advanced
- [ ] Implement hot module replacement for `compose dev`
- [ ] Add TypeScript type generation
- [ ] Build VS Code extension with intellisense
- [ ] Implement `compose ingest` (reverse compiler)

## 🤝 Code Style

- Use ESM imports (`import`/`export`)
- Follow existing patterns in the codebase
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Write descriptive commit messages

## 📜 Commit Messages

```
feat: add Fastify framework support
fix: resolve import path doubling issue
docs: update contributing guide
test: add parser tests for forms
```

## 🔄 Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to your fork (`git push origin feat/amazing-feature`)
7. Open a Pull Request

### PR Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Examples added (if applicable)
- [ ] CHANGELOG.md updated

## 🌟 Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Thanked in release notes
- Given credit in documentation

## 💬 Community

- **GitHub Discussions**: Ask questions, share ideas
- **Issues**: Report bugs, request features
- **Twitter**: Share what you're building with Compose

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping build the future of application development!** 🚀

# Compose-Lang Roadmap

## Vision

**Compose-Lang** is an **LLM-aware build system** that transforms architecture specifications into production code. At its core is the **Intermediate Representation (IR)** - a framework-agnostic format for describing application architecture. The `.compose` DSL is one way to create this IR, but not the only way. Our vision is to support multiple input formats (OpenAPI, GraphQL, existing codebases) while providing deterministic builds via caching, intelligent dependency tracking, and export-aware code generation.

---

## Phase 1: Foundation ✅ (Current)

**Status: Complete**

- [x] Core compiler pipeline (Lexer → Parser → Analyzer → IR → Emitter)
- [x] Multi-file project support with imports
- [x] Real LLM integration (Gemini, OpenAI)
- [x] Response caching for deterministic builds
- [x] Framework-agnostic initialization (`compose init`)
- [x] Intelligent code merging (Vite, Next.js, Express)
- [x] CLI commands (`init`, `build`, `dev`, `run`)

---

## Phase 1.5: Community Feedback & Critical Gaps 🔥 (Q4 2025 - Immediate)

**Goal: Address Reddit/HN feedback and fix critical limitations**

> **Note**: These items emerged from community feedback and are now top priority before expanding features.

### Drift Detection & Validation (Critical)
- [ ] **Export map validation** - Verify new code correctly imports/uses existing exports
- [ ] **Schema validation** - Check generated code matches export map signatures
- [ ] **CI integration** - Detect breaking changes in generated code
- [ ] **Signature change detection** - Warn when LLM output types/signatures drift
- [ ] `compose validate` command - Manual validation before deployment

### Model Version Control (Critical)
- [ ] **Pin model versions** in `compose.json`
- [ ] **Detect provider updates** - Warning when model changes
- [ ] **Lock file for LLM** - Similar to package-lock.json but for model versions
- [ ] **Reproducibility guarantees** - Document what is/isn't deterministic

### Pluggable Architecture (High Priority)
- [ ] **IR-centric refactor** - Make IR the core, DSL optional
- [ ] **OpenAPI → IR adapter** - Use existing OpenAPI specs as input
- [ ] **GraphQL → IR adapter** - Support GraphQL schemas
- [ ] **Code → IR (Compose Ingest)** - Analyze existing code, generate IR
- [ ] **Documentation** - "Pluggable DSL" architecture guide

### Error Handling & DX
- [ ] `compose fix` command - Suggest guides for runtime errors
- [ ] Better error messages when builds fail
- [ ] Validation warnings before LLM calls
- [ ] Token budget tracking and warnings
- [ ] `compose analyze` - Show dependency graph visualization

### Documentation Improvements
- [ ] **"When NOT to use Compose"** section
- [ ] **Honest limitations** documented upfront
- [ ] **Comparison table** with Cursor/Copilot/ChatGPT
- [ ] **Team workflow examples** with git integration
- [ ] **Migration guide** - How to eject if you outgrow it

---

## Phase 2: Developer Experience 🚧 (Q1 2026)

**Goal: Make Compose a joy to use**

### Core Language Improvements
- [ ] Enhanced type system (union types, generics)
- [ ] Type aliases (`type Email = text`)
- [ ] Nested models and composition
- [ ] Enum support
- [ ] Optional/required field modifiers

### Tooling
- [x] VS Code extension (basic - syntax highlighting complete)
  - [ ] Intellisense/autocomplete
  - [x] Error squiggles (LSP integration done)
  - [ ] Jump to definition
  - [ ] Refactoring support
- [ ] Prettier plugin for `.compose` files
- [ ] ESLint plugin for generated code
- [ ] `compose format` command
- [ ] Static type checking on generated code
- [ ] Pre-commit hooks for validation
- [ ] `compose doctor` - Health checks and diagnostics

### Framework Support
- [ ] Astro (frontend)
- [ ] SolidJS (frontend)
- [ ] Remix (frontend)
- [ ] Fastify (backend)
- [ ] NestJS (backend)
- [ ] Hono (backend)

### LLM Providers
- [ ] Anthropic Claude
- [ ] OpenAI o1/o3
- [ ] Local models (Ollama)
- [ ] Custom endpoints

---

## Phase 3: Production Ready 🔮 (Q2-Q3 2026)

**Goal: Enterprise-grade reliability**

> **Note**: Many items from old Phase 3 moved to Phase 1.5 based on community feedback.

### Type System
- [ ] Strict type checking option
- [ ] TypeScript type generation
- [ ] Zod schema generation
- [ ] GraphQL schema generation

### Testing
- [ ] `compose test` command
- [ ] Generate test files alongside code
- [ ] E2E test generation
- [ ] Test coverage reports

### Performance
- [x] Incremental compilation (export map system implemented)
- [ ] Parallel code generation for multiple targets
- [ ] Watch mode optimizations
- [ ] Build caching improvements
- [ ] Distributed caching (team-shared cache)

### Deployment
- [ ] Docker generation
- [ ] Kubernetes manifests
- [ ] Vercel/Netlify configs
- [ ] AWS CDK integration

---

## Phase 4: Ecosystem Growth 🌍 (Q3 2026)

**Goal: Multi-language and multi-platform**

### Language Targets
- [ ] **Backend:**
  - [ ] Java/Spring Boot
  - [ ] C#/.NET
  - [ ] Go (Gin, Echo)
  - [ ] Python (FastAPI, Django)
  - [ ] Rust (Actix, Axum)
- [ ] **Frontend:**
  - [ ] Vue.js
  - [ ] Svelte
  - [ ] Angular
  - [ ] Flutter
- [ ] **Mobile:**
  - [ ] React Native
  - [ ] SwiftUI (iOS)
  - [ ] Jetpack Compose (Android)

### Database Support
- [ ] `database.model` definitions
- [ ] Prisma schema generation
- [ ] Drizzle ORM generation
- [ ] SQL migration generation
- [ ] MongoDB schema generation

### Cloud Integration
- [ ] `deploy.aws` targets
- [ ] `deploy.gcp` targets
- [ ] `deploy.azure` targets
- [ ] Terraform generation
- [ ] Pulumi generation

---

## Phase 5: Compose Ingest 💎 (Q4 2026)

**Goal: Reverse engineering and legacy modernization**

### The Killer Feature

**Compose Ingest** is a **reverse compiler** that analyzes existing codebases and generates `.compose` definitions from them.

#### Use Cases

1. **Legacy Modernization**
   ```bash
   compose ingest ./legacy-java-app
   # Generates .compose files describing the architecture
   compose build --target=nodejs
   # Regenerates as modern Node.js microservices
   ```

2. **Documentation Generation**
   ```bash
   compose ingest ./my-app
   # Creates human-readable architecture docs
   ```

3. **Cross-Platform Migration**
   ```bash
   compose ingest ./react-app
   compose build --target=flutter
   # Convert web app to mobile
   ```

4. **Vendor Lock-in Escape**
   ```bash
   compose ingest ./proprietary-system
   compose build --target=open-source-stack
   ```

#### Implementation

- [ ] Abstract Syntax Tree analysis
- [ ] Pattern recognition (MVC, CRUD, Auth)
- [ ] LLM-powered intent extraction
- [ ] Heuristic-based structure detection
- [ ] Confidence scoring for inferences
- [ ] Interactive refinement

See [docs/compose-ingest.md](docs/compose-ingest.md) for detailed design.

---

## Phase 6: Enterprise & Monetization 💰 (2027)

**Goal: Sustainable business model**

### SaaS Platform
- [ ] **Compose Cloud**
  - Hosted compilation service
  - Team collaboration
  - Private LLM integration
  - SSO/SAML authentication
  - Audit logs

### Enterprise Features
- [ ] On-premise deployment
- [ ] Air-gapped LLM support
- [ ] Custom framework adapters
- [ ] Professional services
- [ ] Training & certification

### Marketplace
- [ ] **Compose Hub**
  - Community templates
  - Pre-built components
  - Framework adapters
  - LLM prompts
  - Verified publishers

---

## Long-Term Vision 🚀 (2028)

### AI-First Development
- [ ] Natural language debugging ("Why is this component slow?")
- [ ] Automated refactoring suggestions
- [ ] Security vulnerability detection
- [ ] Performance optimization recommendations

### Visual Editor
- [ ] Drag-and-drop UI builder
- [ ] Real-time .compose file generation
- [ ] Visual architecture diagrams
- [ ] Collaborative design mode

### Ecosystem
- [ ] Compose LSP (Language Server Protocol)
- [ ] JetBrains plugin
- [ ] GitHub Copilot integration
- [ ] Browser-based playground

---

## Success Metrics

### Year 1 (2026)
- 1,000 GitHub stars
- 50 contributors
- 10,000 projects created
- 5 framework adapters
- 3 LLM providers

### Year 2 (2027)
- 10,000 GitHub stars
- 200 contributors
- 100,000 projects created
- 20 framework adapters
- 1,000 paying enterprise users

### Year 3 (2028)
- Industry standard for architecture definition
- Integration with major cloud providers
- Active ecosystem marketplace
- Self-sustaining open-source community

---

## How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

**Priority areas for contributors:**
1. **Phase 1.5 items** (drift detection, model pinning, OpenAPI adapter)
2. Framework adapters (always needed!)
3. LLM providers (Anthropic, local models)
4. Documentation & examples
5. Tooling improvements (VS Code, CLI)

**High-impact contributions:**
- Drift detection implementation
- OpenAPI → IR parser
- CI integration examples
- Real-world use case documentation

---

**Join us in building the future of software development!** 🌟

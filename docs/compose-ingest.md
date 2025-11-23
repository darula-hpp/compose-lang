# Compose Ingest: Reverse Compiler

## Overview

**Compose Ingest** is a planned feature that will allow Compose-Lang to **reverse-engineer existing codebases** into `.compose` architecture definitions.

Think of it as the opposite of `compose build`:
- `compose build`: `.compose` files → working code
- `compose ingest`: working code → `.compose` files

## The Problem

### Current State
Organizations have **millions of lines of legacy code** that:
- Lacks documentation
- Uses outdated technologies
- Is difficult to migrate
- Has vendor lock-in
- Cannot be easily modernized

### The Compose Ingest Solution
```bash
compose ingest ./legacy-java-monolith
```

**Output:**
```
Analyzing codebase...
✓ Detected Spring Boot application
✓ Found 47 REST endpoints
✓ Found 23 database models
✓ Found 12 authentication flows

Generated .compose files:
  src/types/user.compose
  src/types/product.compose
  src/backend/user-api.compose
  src/backend/product-api.compose
  ...

Confidence: 87%
```

Now you can:
```bash
compose build --target=nodejs
```

And regenerate the entire application in modern Node.js!

---

## Use Cases

### 1. Legacy Modernization
**Problem:** Company has a 10-year-old Java monolith that needs to be rewritten.

**Solution:**
```bash
compose ingest ./java-monolith
# Review generated .compose files
compose build --target=nodejs-microservices
```

**Result:** Fresh, modern microservices architecture based on the original logic.

---

### 2. Architecture Documentation
**Problem:** New team members don't understand the system architecture.

**Solution:**
```bash
compose ingest ./my-app
# Generates human-readable .compose files
```

**Result:** Self-documenting architecture that's always in sync with code.

---

### 3. Cross-Platform Migration
**Problem:** Web app needs to become a mobile app.

**Solution:**
```bash
compose ingest ./react-webapp
compose build --target=react-native
```

**Result:** Mobile app with the same business logic.

---

### 4. Vendor Lock-in Escape
**Problem:** Proprietary platform is too expensive or limiting.

**Solution:**
```bash
compose ingest ./proprietary-system
compose build --target=open-source-stack
```

**Result:** Freedom to choose your tech stack.

---

### 5. Multi-Target Deployment
**Problem:** Need to support multiple platforms simultaneously.

**Solution:**
```bash
compose ingest ./core-app
compose build --target=web,mobile,desktop
```

**Result:** Consistent architecture across all platforms.

---

## How It Works

### Phase 1: Static Analysis
```
Source Code → AST → Pattern Detection
```

1. **Parse source code** into Abstract Syntax Tree
2. **Identify patterns**:
   - MVC controllers → `backend.create-api`
   - React components → `frontend.component`
   - Database models → `define structure`
   - Routes → API endpoints

### Phase 2: Semantic Understanding (LLM)
```
Code + Context → LLM → Intent Extraction
```

1. **Send code snippets to LLM** with context
2. **Ask semantic questions**:
   - "What does this function do?"
   - "What are the inputs and outputs?"
   - "Is this CRUD or custom logic?"
3. **Generate descriptions** for `.compose` files

### Phase 3: Structure Mapping
```
Detected Patterns → Compose Constructs
```

Map identified patterns to Compose constructs:

| Detected | Compose Equivalent |
|----------|-------------------|
| `@RestController` | `backend.create-api` |
| `React.Component` | `frontend.component` |
| `@Entity` | `define structure` |
| `Route('/')` | `frontend.page` |
| Authentication middleware | `backend.auth` |

### Phase 4: Confidence Scoring
```
Generated .compose → Confidence Analysis → User Review
```

1. **Score each inference** (0-100%)
2. **Flag low-confidence items** for human review
3. **Generate inline comments** explaining assumptions

---

## Technical Architecture

### Input Analyzers
Different analyzers for different source languages:

```
compose-ingest/
├── analyzers/
│   ├── java-spring/     # Spring Boot apps
│   ├── nodejs-express/   # Express.js
│   ├── react/            # React apps
│   ├── python-django/    # Django
│   ├── dotnet/           # ASP.NET
│   └── go-gin/           # Go Gin
└── core/
    ├── pattern-matcher.js
    ├── llm-interpreter.js
    └── compose-generator.js
```

### Pattern Matcher
Heuristic-based pattern detection:

```javascript
export class PatternMatcher {
  detectAPIs(ast) {
    // Look for REST controller patterns
    const apis = [];
    
    for (const node of ast.classes) {
      if (hasAnnotation(node, '@RestController')) {
        for (const method of node.methods) {
          if (hasAnnotation(method, '@GetMapping')) {
            apis.push({
              type: 'GET',
              path: getAnnotationValue(method, '@GetMapping'),
              handler: method.name,
              confidence: 95
            });
          }
        }
      }
    }
    
    return apis;
  }
}
```

### LLM Interpreter
Use LLM to understand intent:

```javascript
export class LLMInterpreter {
  async analyzeFunction(code, context) {
    const prompt = `
You are analyzing a function to generate architecture documentation.

Context: ${context}

Code:
${code}

Please describe:
1. What does this function do? (1 sentence)
2. What are the inputs?
3. What is the output?
4. Is this CRUD or custom business logic?
`;

    const response = await llm.generate(prompt);
    return parseResponse(response);
  }
}
```

### Compose Generator
Generate `.compose` files:

```javascript
export class ComposeGenerator {
  generateAPI(apiInfo) {
    return `
backend.create-api "${apiInfo.name}"
  description: "${apiInfo.description}"
  accepts ${apiInfo.params.join(', ')}
  returns ${apiInfo.returnType}
`;
  }
}
```

---

## Example: Ingesting Spring Boot App

### Input: Spring Boot Controller
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    
    @PostMapping
    public User createUser(@RequestBody CreateUserRequest request) {
        return userService.create(request.getName(), request.getEmail());
    }
    
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### Output: Generated .compose File
```compose
import "../types/user.compose"

backend.create-api "GetAllUsers"
  description: "Retrieve all users from the system"
  returns list of User

backend.create-api "CreateUser"
  description: "Create a new user with name and email"
  accepts name as text
  accepts email as text
  returns User

backend.create-api "DeleteUser"
  description: "Delete a user by ID"
  accepts id as number
  returns void
```

---

## Challenges & Solutions

### Challenge 1: Ambiguous Intent
**Problem:** Hard to infer exact business logic from code.

**Solution:**
- Use LLM for semantic understanding
- Provide confidence scores
- Allow manual refinement

### Challenge 2: Complex Codebases
**Problem:** Large codebases are overwhelming.

**Solution:**
- Incremental analysis
- Focus on API boundaries first
- Ignore implementation details initially

### Challenge 3: Framework Variations
**Problem:** Every framework has different patterns.

**Solution:**
- Pluggable analyzer architecture
- Community-contributed analyzers
- Fallback to generic patterns

### Challenge 4: Low Confidence
**Problem:** Can't always be 100% sure.

**Solution:**
- Flag uncertain inferences
- Generate comments with assumptions
- Interactive refinement mode

---

## Roadmap

### Phase 1: MVP (Q3 2025)
- [ ] Java/Spring Boot analyzer
- [ ] Node.js/Express analyzer
- [ ] Basic pattern matching
- [ ] Manual refinement UI

### Phase 2: LLM Integration (Q4 2025)
- [ ] Intent extraction via LLM
- [ ] Confidence scoring
- [ ] Description generation
- [ ] Edge case handling

### Phase 3: Multi-Language (Q1 2026)
- [ ] Python/Django analyzer
- [ ] React analyzer
- [ ] .NET analyzer
- [ ] Go analyzer

### Phase 4: Enterprise (Q2 2026)
- [ ] Batch processing
- [ ] Large codebase support
- [ ] Custom analyzer plugins
- [ ] Migration reports

---

## Impact

### For Developers
- **Faster onboarding**: Understand legacy systems quickly
- **Easier refactoring**: Modernize with confidence
- **Better documentation**: Always up-to-date architecture diagrams

### For Businesses
- **Reduce technical debt**: Systematically modernize legacy systems
- **Avoid vendor lock-in**: Port to any tech stack
- **Increase agility**: Rapid platform migrations

### For the Industry
- **Knowledge preservation**: Capture institutional knowledge
- **Cross-pollination**: Share architectural patterns
- **Standardization**: Common language for architecture

---

## Future Possibilities

### AI-Assisted Migration
```bash
compose ingest ./legacy-app
compose migrate --target=microservices --strategy=strangler-fig
# Generates PR-by-PR migration plan
```

### Visual Diffing
```bash
compose ingest ./v1
compose ingest ./v2
compose diff v1 v2
# Shows architectural changes between versions
```

### Compliance Checking
```bash
compose ingest ./my-app
compose audit --rules=enterprise-standards.yaml
# Checks if architecture meets standards
```

---

## Getting Involved

Compose Ingest is **not yet implemented** but is a key part of our roadmap.

**Ways to contribute:**
1. **Design the API**: How should `compose ingest` work?
2. **Build analyzers**: Create pattern matchers for your favorite framework
3. **Test with real code**: Try ingesting your own projects
4. **Provide feedback**: What features matter most?

Join the discussion: [GitHub Discussions](https://github.com/darula-hpp/compose-lang/discussions)

---

**Compose Ingest will transform how we modernize software.** 🚀

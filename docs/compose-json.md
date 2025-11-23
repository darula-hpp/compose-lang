# Compose Configuration (compose.json)

The `compose.json` file is the central configuration file for Compose projects. It specifies both the LLM model for code generation and the target platforms for compilation.

## File Location

Place `compose.json` in the root of your Compose project.

## Structure

```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4",
    "apiKey": "${OPENAI_API_KEY}",
    "temperature": 0.2,
    "maxTokens": 2048
  },
  "targets": {
    "frontend": {
      "type": "react",
      "framework": "vite",
      "language": "javascript",
      "output": "./generated/frontend",
      "styling": "css",
      "dependencies": ["react", "react-dom"]
    },
    "backend": {
      "type": "node",
      "framework": "express",
      "language": "javascript",
      "output": "./generated/backend",
      "dependencies": ["express", "cors"]
    }
  },
  "global": {
    "packageManager": "npm",
    "nodeVersion": "20",
    "moduleSystem": "esm"
  }
}
```

## LLM Configuration

The `llm` section specifies which AI model should "compile" your Compose code:

| Field | Description | Example |
|-------|-------------|---------|
| `provider` | LLM provider | `"openai"`, `"anthropic"`, `"google"` |
| `model` | Specific model | `"gpt-4"`, `"claude-3-opus"`, `"gemini-pro"` |
| `apiKey` | API key (supports env vars) | `"${OPENAI_API_KEY}"` |
| `temperature` | Creativity (0.0-1.0) | `0.2` (more deterministic) |
| `maxTokens` | Max response length | `2048` |

### API Key Resolution

Use environment variable references for security:
```json
"apiKey": "${OPENAI_API_KEY}"
```

The compiler will automatically resolve `process.env.OPENAI_API_KEY`.

## Target Configuration

The `targets` section defines output platforms. You can have multiple targets.

### Common Target Fields

| Field | Description | Required |
|-------|-------------|----------|
| `type` | Platform type | ✅ |
| `framework` | Framework to use | ❌ |
| `language` | Output language | ✅ |
| `output` | Output directory | ✅ |
| `styling` | CSS approach | ❌ |
| `dependencies` | NPM packages | ❌ |

### Supported Target Types

**Frontend:**
- `react` - React applications
- `vue` - Vue.js applications
- `svelte` - Svelte applications
- `vanilla` - Plain JavaScript

**Backend:**
- `node` - Node.js with Express
- `python` - Python with Flask/Django
- `django` - Django specifically
- `flask` - Flask specifically

### Example Configurations

**React + TypeScript:**
```json
"frontend": {
  "type": "react",
  "framework": "vite",
  "language": "typescript",
  "output": "./dist/frontend",
  "styling": "tailwind",
  "dependencies": ["react", "react-dom", "react-router-dom"]
}
```

**Python Backend:**
```json
"backend": {
  "type": "python",
  "framework": "flask",
  "language": "python",
  "output": "./dist/backend",
  "dependencies": ["flask", "flask-cors", "sqlalchemy"]
}
```

## Global Configuration

Optional global settings:

| Field | Description | Default |
|-------|-------------|---------|
| `packageManager` | Package manager | `"npm"` |
| `nodeVersion` | Node.js version | `"20"` |
| `moduleSystem` | Module system | `"esm"` |

## Usage

The compiler automatically loads `compose.json`:

```bash
compose build          # Uses ./compose.json
compose build -c prod.json  # Use custom config
```

In code:
```javascript
import { loadTargetConfig } from './compiler/emitter/index.js';

const config = loadTargetConfig('./compose.json');
console.log(config.llm.provider);    // "openai"
console.log(config.targets.frontend.type);  // "react"
```

## Multiple Environments

You can have different configs for different environments:

```
compose.json         # Development
compose.prod.json    # Production
compose.staging.json # Staging
```

## Validation

The compiler validates your config on load:

✅ Required fields present  
✅ Valid target types  
✅ Valid provider names  
✅ Output paths specified  

Invalid configs will throw detailed errors:
```
Error: Target "frontend" has invalid type: unknown-framework
```

---

For more information, see the [compiler documentation](./language/architecture.md).

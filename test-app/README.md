# test-app

A Compose Language project.

## Getting Started

### Prerequisites

- Node.js 20+
- OpenAI API key (or other LLM provider)

### Setup

1. Set your API key:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

2. Build the project:
   ```bash
   compose build
   ```

3. Run the generated code:
   ```bash
   cd generated/frontend
   npm install
   npm run dev
   ```

## Project Structure

```
test-app/
├── src/
│   ├── frontend/      # Frontend Compose files
│   ├── backend/       # Backend Compose files
│   └── shared/        # Shared types and utilities
├── generated/         # Generated code (auto-created)
└── compose.json       # Compose configuration
```

## Documentation

- [Compose Language Docs](https://github.com/compose-lang)
- [Getting Started Guide](https://github.com/compose-lang/docs)

## License

MIT

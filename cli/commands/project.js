/**
 * Project Command
 * Creates a new Compose project
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function project(args) {
    const projectName = args[0];

    if (!projectName) {
        throw new Error('Project name is required. Usage: compose project <name>');
    }

    if (existsSync(projectName)) {
        throw new Error(`Directory "${projectName}" already exists`);
    }

    console.log(`🚀 Creating new Compose project: ${projectName}\n`);

    // Create directory structure
    const dirs = [
        projectName,
        join(projectName, 'src'),
        join(projectName, 'src/frontend'),
        join(projectName, 'src/backend'),
        join(projectName, 'src/shared'),
    ];

    dirs.forEach(dir => {
        mkdirSync(dir, { recursive: true });
        console.log(`   ✓ ${dir}/`);
    });

    // Create compose.json
    const composeJson = {
        llm: {
            provider: "openai",
            model: "gpt-4",
            apiKey: "${OPENAI_API_KEY}",
            temperature: 0.2,
            maxTokens: 2048
        },
        targets: {
            frontend: {
                type: "react",
                framework: "vite",
                language: "javascript",
                output: "./generated/frontend",
                styling: "css",
                dependencies: [
                    "react",
                    "react-dom",
                    "react-router-dom"
                ]
            },
            backend: {
                type: "node",
                framework: "express",
                language: "javascript",
                output: "./generated/backend",
                dependencies: [
                    "express",
                    "cors"
                ]
            }
        },
        global: {
            packageManager: "npm",
            nodeVersion: "20",
            moduleSystem: "esm"
        }
    };

    writeFileSync(
        join(projectName, 'compose.json'),
        JSON.stringify(composeJson, null, 2)
    );
    console.log(`   ✓ compose.json`);

    // Create example .compose files
    const sharedTypes = `## Shared data types ##

define structure User
  has id as number
  has name as text
  has email as text
  has createdAt as datetime

define structure Product
  has id as number
  has name as text
  has price as number
  has description as text
`;

    writeFileSync(join(projectName, 'src/shared/types.compose'), sharedTypes);
    console.log(`   ✓ src/shared/types.compose`);

    const frontendExample = `import "shared/types.compose"

## Frontend application ##

frontend.page "Home"
  description: "Landing page for the application"

frontend.page "Products"
  description: "Browse available products"

frontend.component "ProductCard"
  accepts product as Product
  description: "Display a product with image, name, price and buy button"

frontend.state currentUser as "logged in user or null"

frontend.theme "main"
  primaryColor: "#0066FF"
  accentColor: "#FF6B35"
  backgroundColor: "#FFFFFF"
`;

    writeFileSync(join(projectName, 'src/frontend/app.compose'), frontendExample);
    console.log(`   ✓ src/frontend/app.compose`);

    const backendExample = `import "shared/types.compose"

## Backend API ##

backend.read_env DATABASE_URL
backend.read_env API_SECRET

backend.create_api "GetProducts"
  description: "Fetch all products with pagination support"

backend.create_api "GetProductById"
  description: "Fetch a single product by ID"

backend.create_api "CreateUser"
  description: "Register a new user account"

backend.query "FetchUserOrders"
  description: "Get all orders for a specific user"

define function validateEmail
  inputs: email as text
  returns: boolean
  description: "Validate email format using regex"
`;

    writeFileSync(join(projectName, 'src/backend/api.compose'), backendExample);
    console.log(`   ✓ src/backend/api.compose`);

    // Create README
    const readme = `# ${projectName}

A Compose Language project.

## Getting Started

### Prerequisites

- Node.js 20+
- OpenAI API key (or other LLM provider)

### Setup

1. Set your API key:
   \`\`\`bash
   export OPENAI_API_KEY="your-api-key"
   \`\`\`

2. Build the project:
   \`\`\`bash
   compose build
   \`\`\`

3. Run the generated code:
   \`\`\`bash
   cd generated/frontend
   npm install
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── frontend/      # Frontend Compose files
│   ├── backend/       # Backend Compose files
│   └── shared/        # Shared types and utilities
├── generated/         # Generated code (auto-created)
└── compose.json       # Compose configuration
\`\`\`

## Documentation

- [Compose Language Docs](https://github.com/compose-lang)
- [Getting Started Guide](https://github.com/compose-lang/docs)

## License

MIT
`;

    writeFileSync(join(projectName, 'README.md'), readme);
    console.log(`   ✓ README.md`);

    // Create .gitignore
    const gitignore = `node_modules/
generated/
.env
.DS_Store
*.log
`;

    writeFileSync(join(projectName, '.gitignore'), gitignore);
    console.log(`   ✓ .gitignore`);

    // Success message
    console.log(`\n✨ Project created successfully!\n`);
    console.log(`Next steps:`);
    console.log(`  cd ${projectName}`);
    console.log(`  export OPENAI_API_KEY="your-api-key"`);
    console.log(`  compose build\n`);
}

/**
 * Init Command
 * Interactive project initialization with framework scaffolding
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

const FRONTEND_FRAMEWORKS = {
    'vite-react': {
        name: 'Vite + React',
        command: 'npm create vite@latest {{OUTPUT}} -- --template react',
        type: 'react',
        framework: 'vite'
    },
    'next': {
        name: 'Next.js',
        command: 'npx create-next-app@latest {{OUTPUT}} --typescript --tailwind --app',
        type: 'react',
        framework: 'next'
    },
    'remix': {
        name: 'Remix',
        command: 'npx create-remix@latest {{OUTPUT}}',
        type: 'react',
        framework: 'remix'
    },
    'skip': {
        name: 'Skip (no frontend)',
        command: null,
        type: null,
        framework: null
    }
};

const BACKEND_FRAMEWORKS = {
    'express': {
        name: 'Express',
        command: 'npm init -y && npm install express cors',
        type: 'node',
        framework: 'express'
    },
    'fastify': {
        name: 'Fastify',
        command: 'npm init -y && npm install fastify @fastify/cors',
        type: 'node',
        framework: 'fastify'
    },
    'skip': {
        name: 'Skip (no backend)',
        command: null,
        type: null,
        framework: null
    }
};

export async function init(args) {
    console.log('🚀 Initialize Compose Project\n');

    // Prompt for project name
    const projectName = await promptInput('Project name:', 'my-compose-app');

    // Create project directory
    if (!existsSync(projectName)) {
        mkdirSync(projectName, { recursive: true });
    }

    process.chdir(projectName);
    console.log(`\n📁 Created project directory: ${projectName}\n`);

    // Check if compose.json already exists
    if (existsSync('./compose.json')) {
        console.log('⚠️  compose.json already exists. Reinitializing...\n');
    }

    // Prompt for frontend framework
    const frontendChoice = await promptChoice(
        'Select frontend framework:',
        Object.entries(FRONTEND_FRAMEWORKS).map(([key, config]) => ({ key, ...config }))
    );

    // Prompt for backend framework
    const backendChoice = await promptChoice(
        'Select backend framework:',
        Object.entries(BACKEND_FRAMEWORKS).map(([key, config]) => ({ key, ...config }))
    );

    // Prompt for example files
    const includeExamples = await promptYesNo('Include example .compose files?', true);

    console.log('\n📦 Initializing project...\n');

    const targets = {};

    // Initialize frontend
    if (frontendChoice !== 'skip') {
        const frontendConfig = FRONTEND_FRAMEWORKS[frontendChoice];
        const outputDir = './generated/frontend';

        console.log(`\n   Frontend: ${frontendConfig.name}`);

        if (frontendConfig.command) {
            const command = frontendConfig.command.replace('{{OUTPUT}}', outputDir);
            console.log(`   Running: ${command}\n`);

            try {
                execSync(command, { stdio: 'inherit', cwd: process.cwd() });
                console.log(`   ✓ Frontend initialized\n`);

                targets.frontend = {
                    entry: './src/frontend/app.compose',
                    type: frontendConfig.type,
                    framework: frontendConfig.framework,
                    language: 'javascript',
                    output: outputDir
                };
            } catch (error) {
                console.error(`   ❌ Failed to initialize frontend: ${error.message}`);
            }
        }
    }

    // Initialize backend
    if (backendChoice !== 'skip') {
        const backendConfig = BACKEND_FRAMEWORKS[backendChoice];
        const outputDir = './generated/backend';

        console.log(`\n   Backend: ${backendConfig.name}`);

        if (backendConfig.command) {
            const command = backendConfig.command;
            console.log(`   Running: ${command}\n`);

            try {
                // Create directory first
                execSync(`mkdir -p ${outputDir}`, { cwd: process.cwd() });

                // Run initialization command in output directory
                execSync(command, { stdio: 'inherit', cwd: outputDir });
                console.log(`   ✓ Backend initialized\n`);

                targets.backend = {
                    entry: './src/backend/api.compose',
                    type: backendConfig.type,
                    framework: backendConfig.framework,
                    language: 'javascript',
                    output: outputDir
                };
            } catch (error) {
                console.error(`   ❌ Failed to initialize backend: ${error.message}`);
            }
        }
    }

    // Create/update compose.json
    const composeConfig = {
        llm: {
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            apiKey: '${GEMINI_API_KEY}',
            temperature: 0.2,
            maxTokens: 8192
        },
        targets,
        global: {
            packageManager: 'npm',
            nodeVersion: '20',
            moduleSystem: 'esm'
        }
    };

    writeFileSync('./compose.json', JSON.stringify(composeConfig, null, 2));
    console.log('   ✓ Created compose.json\n');

    // Create example .compose files if requested
    if (includeExamples) {
        console.log('   Creating example .compose files...\n');
        createExampleFiles();
        console.log('   ✓ Created example files\n');
    }

    // Print next steps
    console.log('✨ Initialization complete!\n');
    console.log('Next steps:');
    if (includeExamples) {
        console.log('  1. Review the example .compose files in src/');
        console.log('  2. Run: compose build');
        console.log('  3. Install dependencies and start dev servers\n');
    } else {
        console.log('  1. Create your .compose files in src/');
        console.log('  2. Run: compose build');
        console.log('  3. Install dependencies and start dev servers\n');
    }
}

/**
 * Prompt user to choose from options
 */
async function promptChoice(question, options) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(question);
    options.forEach((opt, idx) => {
        const marker = idx === 0 ? '❯' : ' ';
        console.log(`  ${marker} ${opt.name}`);
    });

    return new Promise((resolve) => {
        rl.question('\nYour choice (1-' + options.length + '): ', (answer) => {
            rl.close();
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < options.length) {
                resolve(options[index].key);
            } else {
                console.log('Invalid choice, using first option');
                resolve(options[0].key);
            }
        });
    });
}

/**
 * Prompt for text input
 */
async function promptInput(question, defaultValue) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${question} (${defaultValue}): `, (answer) => {
            rl.close();
            resolve(answer.trim() || defaultValue);
        });
    });
}

/**
 * Prompt for yes/no
 */
async function promptYesNo(question, defaultValue = true) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const defaultStr = defaultValue ? 'Y/n' : 'y/N';

    return new Promise((resolve) => {
        rl.question(`${question} (${defaultStr}): `, (answer) => {
            rl.close();
            const trimmed = answer.trim().toLowerCase();
            if (!trimmed) {
                resolve(defaultValue);
            } else {
                resolve(trimmed === 'y' || trimmed === 'yes');
            }
        });
    });
}

/**
 * Create example .compose files
 */
function createExampleFiles() {
    // Create directory structure
    mkdirSync('src/types', { recursive: true });
    mkdirSync('src/frontend', { recursive: true });
    mkdirSync('src/backend', { recursive: true });

    // Create types file
    writeFileSync('src/types/todo.compose', `define structure Todo
  has id as number
  has title as text
  has completed as boolean
  has createdAt as date
`);

    // Create frontend file
    writeFileSync('src/frontend/app.compose', `import "../types/todo.compose"

frontend.page "Home"
  description: "A todo list application with add, complete, and delete functionality"
  
frontend.component "TodoForm"
  description: "Form to add new todo items with a text input and submit button"
  
frontend.component "TodoItem"
  description: "Display a single todo item with title, checkbox to toggle completion, and delete button"
  accepts todo as Todo
`);

    // Create backend file
    writeFileSync('src/backend/api.compose', `import "../types/todo.compose"

backend.create-api "CreateTodo"
  description: "Create a new todo item"
  accepts title as text
  returns Todo
  
backend.create-api "GetTodos"
  description: "Get all todo items"
  returns list of Todo

backend.create-api "ToggleTodo"
  description: "Toggle todo completion status"
  accepts id as number
  returns Todo
  
backend.create-api "DeleteTodo"
  description: "Delete a todo by ID"
  accepts id as number
  returns void
`);
}

#!/usr/bin/env node

/**
 * Compose CLI
 * Main entry point for the Compose command-line interface
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

// Show version
if (command === '--version' || command === '-v') {
    console.log(`compose v${packageJson.version}`);
    process.exit(0);
}

// Show help
if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
}

// Route to command
try {
    switch (command) {
        case 'build':
            const { build } = await import('./commands/build.js');
            await build(args.slice(1));
            break;

        case 'dev':
            const { dev } = await import('./commands/dev.js');
            await dev(args.slice(1));
            break;

        case 'project':
            const { project } = await import('./commands/project.js');
            await project(args.slice(1));
            break;

        case 'run':
            const { run } = await import('./commands/run.js');
            await run(args.slice(1));
            break;

        default:
            console.error(`Unknown command: ${command}`);
            console.error('Run "compose --help" for usage information.');
            process.exit(1);
    }
} catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
    process.exit(1);
}

function showHelp() {
    console.log(`
Compose Language Compiler v${packageJson.version}

Usage:
  compose <command> [options]

Commands:
  build              Compile .compose files to target code
  dev                Watch mode with automatic rebuilds
  project <name>     Create a new Compose project
  run [target]       Run the generated application

Options:
  -v, --version      Show version number
  -h, --help         Show this help message
  --debug            Enable debug output

Examples:
  compose project my-app          Create new project
  compose build                   Build current project
  compose dev                     Start development mode
  compose run frontend            Run generated frontend

Documentation: https://compose-lang.dev
  `);
}

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

        case 'init':
            (await import('./commands/init.js')).init(args);
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

        case 'eject':
            const { eject } = await import('./commands/eject.js');
            await eject(args.slice(1));
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
Compose Language Compiler - v1.0.0

Usage:
  compose <command> [options]

Commands:
  init                    Initialize a new Compose project (recommended)
  build                   Compile .compose files to target code
  dev                     Watch and rebuild on file changes  
  run [target]            Start the generated application
  eject                   Eject from Compose and take full ownership of code
  project <name>          Create project with examples (deprecated, use init)

Examples:
  compose init            Create new project with framework scaffolding
  compose build           Build current project
  compose dev             Start development mode
  compose run frontend    Run generated frontend
  compose eject           Graduate from Compose management

Options:
  --help, -h              Show this help message
  --version, -v           Show version number
  --debug                 Enable debug output

Documentation: https://compose-lang.dev
`);
}

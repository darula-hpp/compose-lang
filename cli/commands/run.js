/**
 * Run Command
 * Runs the generated application
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadComposeConfig } from '../../compiler/emitter/compose-config.js';

export async function run(args) {
    const targetName = args[0] || 'frontend';

    console.log(`🚀 Running ${targetName}...\n`);

    // Load config to find output directory
    const config = loadComposeConfig('./compose.json');
    const target = config.targets[targetName];

    if (!target) {
        throw new Error(`Target "${targetName}" not found in compose.json`);
    }

    const outputDir = target.output;

    if (!existsSync(outputDir)) {
        throw new Error(`Output directory not found: ${outputDir}\nRun "compose build" first.`);
    }

    // Check if dependencies are installed
    const packageJsonPath = join(outputDir, 'package.json');
    const nodeModulesPath = join(outputDir, 'node_modules');

    if (!existsSync(nodeModulesPath)) {
        console.log('📦 Installing dependencies...\n');
        await runCommand('npm', ['install'], outputDir);
    }

    // Run the dev server
    console.log(`\n🎯 Starting ${targetName} server...\n`);

    const devScript = target.framework === 'vite' ? 'dev' :
        target.type === 'node' ? 'start' : 'dev';

    await runCommand('npm', ['run', devScript], outputDir);
}

/**
 * Run a command and stream output
 */
function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true
        });

        proc.on('close', code => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
            } else {
                resolve();
            }
        });

        proc.on('error', reject);
    });
}

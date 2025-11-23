/**
 * Build Command
 * Compiles .compose files to target code
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { compile } from '../../compiler/index.js';
import { loadTargetConfig } from '../../compiler/emitter/target-config.js';
import { emitCode } from '../../compiler/emitter/code-emitter.js';
import { writeOutput } from '../../compiler/emitter/output-writer.js';

export async function build(args) {
    console.log('🔨 Building Compose project...\n');

    // Load configuration
    const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1] || './compose.json';

    if (!existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
    }

    const config = loadTargetConfig(configPath);
    console.log(`📋 Configuration: ${configPath}`);
    console.log(`🤖 LLM: ${config.llm?.provider || 'mock'} (${config.llm?.model || 'mock'})`);

    // Compile entry points for each target
    console.log('\n⚙️  Compiling...');
    const results = {};
    const baseDir = process.cwd();
    const targetNames = Object.keys(config.targets);

    for (const targetName of targetNames) {
        const target = config.targets[targetName];

        if (!target.entry) {
            console.warn(`⚠️  No entry point defined for target '${targetName}', skipping...`);
            continue;
        }

        const entryPath = join(baseDir, target.entry);
        if (!existsSync(entryPath)) {
            throw new Error(`Entry file not found for target '${targetName}': ${target.entry}`);
        }

        console.log(`   Target: ${targetName} -> ${target.entry}`);

        const source = readFileSync(entryPath, 'utf8');
        const result = compile(source, entryPath, { baseDir, loadImports: true });

        if (!result.success) {
            console.error(`\n❌ Compilation failed for ${target.entry}:`);
            result.errors.forEach(err => {
                console.error(`   ${err.type}: ${err.message}`);
                console.error(`   at ${err.location.file}:${err.location.line}:${err.location.column}`);
            });
            process.exit(1);
        }

        results[targetName] = result;
        console.log(`   ✓ Compiled successfully`);
    }

    // Generate code for each target
    console.log('\n🎨 Generating code...');

    for (const targetName of targetNames) {
        const target = config.targets[targetName];
        console.log(`\n   Target: ${targetName} (${target.type})`);

        // Get IR for this target
        const result = results[targetName];
        if (!result) continue;

        const combinedIR = result.ir;

        // Generate code with LLM config
        const output = await emitCode(combinedIR, target, {
            llm: config.llm
        });

        console.log(`   Generated ${output.files.length} file(s)`);

        // Write output
        const writeResult = writeOutput(output.files, target.output, target);

        if (writeResult.success) {
            console.log(`   ✓ Written to ${target.output}`);
        } else {
            console.error(`   ❌ Write errors:`);
            writeResult.errors.forEach(err => {
                console.error(`      ${err.path}: ${err.error}`);
            });
        }
    }

    console.log('\n✨ Build complete!\n');
}

/**
 * Find all .compose files recursively
 */
function findComposeFiles(dir, files = []) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        // Skip node_modules, generated, and hidden directories
        if (entry.isDirectory() && !entry.name.startsWith('.') &&
            entry.name !== 'node_modules' && entry.name !== 'generated') {
            findComposeFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.compose')) {
            files.push(fullPath);
        }
    }

    return files;
}

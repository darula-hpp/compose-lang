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

    // Find all .compose files
    const composeFiles = findComposeFiles('./');

    if (composeFiles.length === 0) {
        throw new Error('No .compose files found in current directory');
    }

    console.log(`\n📁 Found ${composeFiles.length} .compose file(s):`);
    composeFiles.forEach(file => console.log(`   - ${file}`));

    // Compile each file with module loading
    console.log('\n⚙️  Compiling...');
    const results = [];
    const baseDir = process.cwd();

    for (const file of composeFiles) {
        const source = readFileSync(file, 'utf8');
        const result = compile(source, file, { baseDir, loadImports: true });

        if (!result.success) {
            console.error(`\n❌ Compilation failed for ${file}:`);
            result.errors.forEach(err => {
                console.error(`   ${err.type}: ${err.message}`);
                console.error(`   at ${err.location.file}:${err.location.line}:${err.location.column}`);
            });
            process.exit(1);
        }

        results.push({ file, ...result });
        console.log(`   ✓ ${file}`);
    }

    // Generate code for each target
    console.log('\n🎨 Generating code...');
    const targetNames = Object.keys(config.targets);

    for (const targetName of targetNames) {
        const target = config.targets[targetName];
        console.log(`\n   Target: ${targetName} (${target.type})`);

        // Combine all IRs (in real app, would handle imports properly)
        const combinedIR = results[0].ir; // Simplified for now

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

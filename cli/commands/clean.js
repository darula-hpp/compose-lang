/**
 * Clean Command
 * Removes generated code and build cache
 */

import { existsSync, rmSync, readFileSync } from 'fs';
import { loadTargetConfig } from '../../compiler/emitter/target-config.js';

export async function clean(args) {
    console.log('🧹 Cleaning Compose project...\n');

    let cleaned = false;

    // Clean generated directories from compose.json
    if (existsSync('./compose.json')) {
        const config = loadTargetConfig('./compose.json');
        const targets = config.targets || {};

        for (const [targetName, target] of Object.entries(targets)) {
            const outputDir = target.output;

            if (existsSync(outputDir)) {
                console.log(`   🗑️  Removing ${outputDir}`);
                rmSync(outputDir, { recursive: true, force: true });
                console.log(`      ✓ Removed`);
                cleaned = true;
            }
        }

        // Also clean generic generated/ folder if it exists
        if (existsSync('./generated')) {
            console.log(`   🗑️  Removing ./generated`);
            rmSync('./generated', { recursive: true, force: true });
            console.log(`      ✓ Removed`);
            cleaned = true;
        }
    } else {
        // No compose.json, just clean generic folders
        if (existsSync('./generated')) {
            console.log(`   🗑️  Removing ./generated`);
            rmSync('./generated', { recursive: true, force: true });
            console.log(`      ✓ Removed`);
            cleaned = true;
        }
    }

    // Clean .compose cache
    if (existsSync('./.compose')) {
        console.log(`   🗑️  Removing .compose cache`);
        rmSync('./.compose', { recursive: true, force: true });
        console.log(`      ✓ Removed`);
        cleaned = true;
    }

    if (!cleaned) {
        console.log('   ℹ️  Nothing to clean');
    }

    console.log('\n✨ Clean complete!\n');
}

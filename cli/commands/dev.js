/**
 * Dev Command
 * Watch mode with automatic rebuilds
 */

import { watch } from 'fs';
import { build } from './build.js';

export async function dev(args) {
    console.log('👀 Starting Compose dev mode...\n');
    console.log('Watching for .compose file changes...');
    console.log('Press Ctrl+C to stop\n');

    // Initial build
    try {
        await build(args);
    } catch (error) {
        console.error(`Initial build failed: ${error.message}`);
    }

    // Watch for changes
    const watcher = watch('./', { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.compose')) {
            console.log(`\n📝 Changed: ${filename}`);
            console.log('🔄 Rebuilding...\n');

            try {
                await build(args);
                console.log('✅ Rebuild successful');
            } catch (error) {
                console.error(`❌ Rebuild failed: ${error.message}`);
            }
        }
    });

    // Handle shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Stopping dev mode...');
        watcher.close();
        process.exit(0);
    });
}

/**
 * Asset copying utilities (v0.2.0)
 * Handles copying target-specific assets defined in compose.json
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Copy assets based on target configuration
 * @param {string} projectRoot - Project root directory
 * @param {object} targetConfig - Target configuration from compose.json
 */
export function copyAssets(projectRoot, targetConfig) {
    // Check if target has assets defined
    if (!targetConfig.assets || targetConfig.assets.length === 0) {
        return; // No assets to copy
    }

    let copiedCount = 0;

    // Copy each asset mapping: [from, to]
    for (const [from, to] of targetConfig.assets) {
        const sourcePath = join(projectRoot, from);
        const destPath = join(targetConfig.output, to);

        // Check if source exists
        if (!existsSync(sourcePath)) {
            console.warn(`   ⚠ Asset source not found: ${from}`);
            continue;
        }

        const stat = statSync(sourcePath);

        if (stat.isDirectory()) {
            // Copy entire directory
            copyDirectory(sourcePath, destPath);
            copiedCount++;
        } else {
            // Copy single file
            const destDir = dirname(destPath);
            if (!existsSync(destDir)) {
                mkdirSync(destDir, { recursive: true });
            }
            copyFileSync(sourcePath, destPath);
            copiedCount++;
        }
    }

    if (copiedCount > 0) {
        console.log(`   ✓ Copied ${copiedCount} asset(s)`);
    }
}

/**
 * Recursively copy directory contents
 * @param {string} source - Source directory
 * @param {string} destination - Destination directory
 */
function copyDirectory(source, destination) {
    // Skip common metadata files
    const skipFiles = ['README.md', '.gitkeep', '.DS_Store', 'Thumbs.db'];

    // Create destination directory
    if (!existsSync(destination)) {
        mkdirSync(destination, { recursive: true });
    }

    const files = readdirSync(source);

    for (const file of files) {
        if (skipFiles.includes(file)) continue;

        const sourcePath = join(source, file);
        const destPath = join(destination, file);

        const stat = statSync(sourcePath);

        if (stat.isDirectory()) {
            // Recursively copy subdirectory
            copyDirectory(sourcePath, destPath);
        } else {
            // Copy file
            copyFileSync(sourcePath, destPath);
        }
    }
}

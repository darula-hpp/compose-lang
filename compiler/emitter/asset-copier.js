/**
 * Asset copying utilities
 * Handles copying static assets from assets/ to framework output
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Copy assets from source to destination
 * @param {string} projectRoot - Project root directory
 * @param {object} targetConfig - Target configuration
 */
export function copyAssets(projectRoot, targetConfig) {
    const assetsSource = join(projectRoot, 'assets');

    // Check if assets directory exists
    if (!existsSync(assetsSource)) {
        return; // No assets to copy
    }

    // Determine public directory based on framework
    const publicDir = getPublicDir(targetConfig.framework);
    const assetsOutput = join(targetConfig.output, publicDir);

    // Create output directory if it doesn't exist
    if (!existsSync(assetsOutput)) {
        mkdirSync(assetsOutput, { recursive: true });
    }

    // Copy all files from assets/ to output
    copyDirectory(assetsSource, assetsOutput);

    console.log(`   ✓ Copied assets to ${publicDir}/`);
}

/**
 * Get public directory path for framework
 */
function getPublicDir(framework) {
    const publicDirs = {
        'next': 'public',
        'nextjs': 'public',
        'vite': 'public',
        'vite-react': 'public',
        'remix': 'public',
        'react-native': 'assets',
        'express': 'public',
        'fastify': 'public'
    };

    return publicDirs[framework] || 'public';
}

/**
 * Recursively copy directory contents
 */
function copyDirectory(source, destination) {
    // Skip README.md and .gitkeep
    const skipFiles = ['README.md', '.gitkeep'];

    const files = readdirSync(source);

    for (const file of files) {
        if (skipFiles.includes(file)) continue;

        const sourcePath = join(source, file);
        const destPath = join(destination, file);

        const stat = statSync(sourcePath);

        if (stat.isDirectory()) {
            // Create directory and copy contents recursively
            if (!existsSync(destPath)) {
                mkdirSync(destPath, { recursive: true });
            }
            copyDirectory(sourcePath, destPath);
        } else {
            // Copy file
            const destDir = dirname(destPath);
            if (!existsSync(destDir)) {
                mkdirSync(destDir, { recursive: true });
            }
            copyFileSync(sourcePath, destPath);
        }
    }
}

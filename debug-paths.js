/**
 * Debug script to test Next.js path normalization
 */

import { join } from 'path';

function normalizePath(filePath, targetDir) {
    // Remove leading ./ or /
    let normalized = filePath.replace(/^\.?\//, '');

    // Extract the last part of targetDir (e.g., "web" from "./generated/web")
    const targetDirParts = targetDir.replace(/^\.?\//, '').split('/');

    // Try to find and remove common prefixes
    // Check for patterns like: "generated/web/src/App.jsx" when targetDir is "./generated/web"
    for (let i = targetDirParts.length; i > 0; i--) {
        const prefix = targetDirParts.slice(-i).join('/') + '/';
        if (normalized.startsWith(prefix)) {
            normalized = normalized.substring(prefix.length);
            break;
        }
    }

    return normalized;
}

// Simulate Next.js scenario
const targetDir = './generated/web';

const testCases = [
    'generated/web/app/page.tsx',
    'generated/web/app/layout.tsx',
    'generated/web/package.json',
    'app/page.tsx',
    './generated/web/app/page.tsx',
    '/generated/web/components/Button.tsx',
];

console.log('Target Directory:', targetDir);
console.log('='.repeat(80));

for (const filePath of testCases) {
    const normalized = normalizePath(filePath, targetDir);
    const final = join(targetDir, normalized);

    console.log('\nOriginal path:', filePath);
    console.log('Normalized:', normalized);
    console.log('Final path:', final);
    console.log('Has nested?:', final.includes('generated/web/generated/web'));
}

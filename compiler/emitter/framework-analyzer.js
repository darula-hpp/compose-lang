/**
 * Framework Analyzer
 * Detects framework type and structure from generated projects
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Detect framework from project structure
 * @param {string} targetDir - Directory to analyze
 * @returns {object} - Framework info
 */
export function detectFramework(targetDir) {
    try {
        // Check if package.json exists
        const packagePath = join(targetDir, 'package.json');
        if (!existsSync(packagePath)) {
            return { type: 'unknown', framework: 'none', routing: 'none' };
        }

        const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

        // Detect Next.js
        if (pkg.dependencies?.next || pkg.devDependencies?.next) {
            return {
                type: 'react',
                framework: 'next',
                routing: 'file-based',
                componentDir: 'components',
                pagesDir: 'pages',
                apiDir: 'pages/api',
                entryPoint: 'pages/_app.js'
            };
        }

        // Detect Remix
        if (pkg.dependencies?.['@remix-run/react'] || pkg.devDependencies?.['@remix-run/dev']) {
            return {
                type: 'react',
                framework: 'remix',
                routing: 'file-based',
                componentDir: 'app/components',
                pagesDir: 'app/routes',
                entryPoint: 'app/root.tsx'
            };
        }

        // Detect Vite
        if (pkg.devDependencies?.vite) {
            return {
                type: 'react',
                framework: 'vite',
                routing: 'react-router',
                componentDir: 'src/components',
                pagesDir: 'src/pages',
                entryPoint: 'src/App.jsx',
                mainFile: 'src/main.jsx'
            };
        }

        // Detect Express
        if (pkg.dependencies?.express) {
            return {
                type: 'node',
                framework: 'express',
                routing: 'explicit',
                routesDir: 'routes',
                entryPoint: 'server.js'
            };
        }

        // Detect Fastify
        if (pkg.dependencies?.fastify) {
            return {
                type: 'node',
                framework: 'fastify',
                routing: 'explicit',
                routesDir: 'routes',
                entryPoint: 'server.js'
            };
        }

        return { type: 'unknown', framework: 'none', routing: 'none' };
    } catch (error) {
        console.warn(`Failed to detect framework: ${error.message}`);
        return { type: 'unknown', framework: 'none', routing: 'none' };
    }
}

/**
 * Get injection points for a framework
 * @param {object} framework Info - Framework detection result
 * @param {string} targetDir - Target directory
 * @returns {object} - Injection points
 */
export function getInjectionPoints(frameworkInfo, targetDir) {
    const { framework } = frameworkInfo;

    switch (framework) {
        case 'vite':
            return {
                routeImports: join(targetDir, frameworkInfo.entryPoint),
                routeDefinitions: join(targetDir, frameworkInfo.entryPoint),
                componentDir: join(targetDir, frameworkInfo.componentDir),
                pagesDir: join(targetDir, frameworkInfo.pagesDir)
            };

        case 'next':
            return {
                pagesDir: join(targetDir, frameworkInfo.pagesDir),
                componentDir: join(targetDir, frameworkInfo.componentDir),
                apiDir: join(targetDir, frameworkInfo.apiDir)
            };

        case 'express':
        case 'fastify':
            return {
                routesDir: join(targetDir, frameworkInfo.routesDir),
                entryPoint: join(targetDir, frameworkInfo.entryPoint)
            };

        default:
            return {};
    }
}

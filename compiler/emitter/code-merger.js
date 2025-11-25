/**
 * Code Merger
 * Intelligently merges generated code into framework structures
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Normalize file path by removing common output directory prefixes
 * Handles cases where LLM includes the output directory in file paths
 * @param {string} filePath - Generated file path
 * @param {string} targetDir - Target output directory
 * @returns {string} - Normalized path
 */
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

/**
 * Merge generated code into framework structure
 * @param {object} generatedFiles - Files from code generator
 * @param {object} frameworkInfo - Framework detection result
 * @param {string} targetDir - Target directory
 */
export function mergeCode(generatedFiles, frameworkInfo, targetDir) {
    const { framework } = frameworkInfo;

    switch (framework) {
        case 'vite':
            return mergeViteCode(generatedFiles, frameworkInfo, targetDir);

        case 'next':
            return mergeNextCode(generatedFiles, frameworkInfo, targetDir);

        case 'express':
        case 'fastify':
            return mergeExpressCode(generatedFiles, frameworkInfo, targetDir);

        default:
            // Fallback: just write files to output directory
            return writeDirectly(generatedFiles, targetDir);
    }
}

/**
 * Merge code for Vite + React projects
 */
function mergeViteCode(generatedFiles, frameworkInfo, targetDir) {
    const appFilePath = join(targetDir, frameworkInfo.entryPoint);

    // Collect pages and components
    const pages = [];
    const components = [];

    for (const file of generatedFiles) {
        const normalizedPath = normalizePath(file.path, targetDir);

        if (normalizedPath.includes('/pages/') || normalizedPath.includes('pages/')) {
            pages.push({ ...file, path: normalizedPath });
            // Write page file
            writeFile(join(targetDir, 'src', normalizedPath), file.content);
        } else if (normalizedPath.includes('/components/') || normalizedPath.includes('components/')) {
            components.push({ ...file, path: normalizedPath });
            // Write component file
            writeFile(join(targetDir, 'src', normalizedPath), file.content);
        } else {
            // Write other files (utils, types, etc.)
            writeFile(join(targetDir, 'src', normalizedPath), file.content);
        }
    }

    // Update App.jsx with routes
    if (pages.length > 0 && existsSync(appFilePath)) {
        injectViteRoutes(appFilePath, pages);
    }

    return { success: true, files: generatedFiles.length };
}

/**
 * Inject routes into Vite App.jsx
 */
function injectViteRoutes(appFilePath, pages) {
    // Generate import statements
    const imports = pages.map(page => {
        const name = page.path.split('/').pop().replace('.js', '').replace('.jsx', '');
        const path = `./pages/${name}`;
        return `import ${name} from '${path}';`;
    }).join('\n');

    // Generate route definitions
    const routes = pages.map(page => {
        const name = page.path.split('/').pop().replace('.js', '').replace('.jsx', '');
        const routePath = name === 'Home' ? '/' : `/${name.toLowerCase()}`;
        return `        <Route path="${routePath}" element={<${name} />} />`;
    }).join('\n');

    // Always create a fresh App.jsx with React Router
    const appContent = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${imports}

function App() {
  return (
    <BrowserRouter>
      <Routes>
${routes}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`;

    writeFileSync(appFilePath, appContent);
}

/**
 * Merge code for Next.js projects  
 */
function mergeNextCode(generatedFiles, frameworkInfo, targetDir) {
    for (const file of generatedFiles) {
        const normalizedPath = normalizePath(file.path, targetDir);

        // For Next.js, just write files directly to targetDir
        // Don't add additional 'pages' or 'components' subdirectories
        // because the normalized path already includes them
        writeFile(join(targetDir, normalizedPath), file.content);
    }

    return { success: true, files: generatedFiles.length };
}

/**
 * Merge code for Express projects
 */
function mergeExpressCode(generatedFiles, frameworkInfo, targetDir) {
    const serverFilePath = join(targetDir, frameworkInfo.entryPoint);
    const routes = [];

    for (const file of generatedFiles) {
        const normalizedPath = normalizePath(file.path, targetDir);

        if (normalizedPath.includes('/routes/') || normalizedPath.includes('routes/')) {
            routes.push({ ...file, path: normalizedPath });
            writeFile(join(targetDir, 'routes', normalizedPath), file.content);
        } else {
            writeFile(join(targetDir, normalizedPath), file.content);
        }
    }

    // Inject route imports and registrations into server file
    if (routes.length > 0 && existsSync(serverFilePath)) {
        injectExpressRoutes(serverFilePath, routes);
    }

    return { success: true, files: generatedFiles.length };
}

/**
 * Inject routes into Express server.js
 */
function injectExpressRoutes(serverFilePath, routes) {
    let serverContent = readFileSync(serverFilePath, 'utf8');

    // Generate import statements
    const imports = routes.map(route => {
        const name = route.path.split('/').pop().replace('.js', '');
        return `import ${name} from './routes/${name}.js';`;
    }).join('\n');

    // Generate route registrations
    const registrations = routes.map(route => {
        const name = route.path.split('/').pop().replace('.js', '');
        // Extract HTTP method and path from file content
        const method = 'get'; // TODO: Parse from file
        const path = `/api/${name.toLowerCase()}`;
        return `app.${method}('${path}', ${name});`;
    }).join('\n');

    // Add imports after other imports
    if (serverContent.includes('import')) {
        const lastImport = serverContent.lastIndexOf('import');
        const endOfLine = serverContent.indexOf('\n', lastImport);
        serverContent = serverContent.slice(0, endOfLine + 1) + imports + '\n' + serverContent.slice(endOfLine + 1);
    }

    // Add route registrations before app.listen
    if (serverContent.includes('app.listen')) {
        serverContent = serverContent.replace('app.listen', registrations + '\n\napp.listen');
    }

    writeFileSync(serverFilePath, serverContent);
}

/**
 * Write generated files directly (fallback)
 */
function writeDirectly(generatedFiles, targetDir) {
    for (const file of generatedFiles) {
        const normalizedPath = normalizePath(file.path, targetDir);
        writeFile(join(targetDir, normalizedPath), file.content);
    }
    return { success: true, files: generatedFiles.length };
}

/**
 * Write file and create directories if needed
 */
function writeFile(filePath, content) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, content);
}

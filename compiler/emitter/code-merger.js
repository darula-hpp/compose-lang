/**
 * Code Merger
 * Intelligently merges generated code into framework structures
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

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
        if (file.path.includes('/pages/')) {
            pages.push(file);
            // Write page file
            writeFile(join(targetDir, 'src', file.path), file.content);
        } else if (file.path.includes('/components/')) {
            components.push(file);
            // Write component file
            writeFile(join(targetDir, 'src', file.path), file.content);
        } else {
            // Write other files (utils, types, etc.)
            writeFile(join(targetDir, 'src', file.path), file.content);
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
    // For Next.js, just write pages to pages/ directory
    // Next.js uses file-based routing, so no injection needed

    for (const file of generatedFiles) {
        if (file.path.includes('/pages/')) {
            writeFile(join(targetDir, file.path), file.content);
        } else if (file.path.includes('/components/')) {
            writeFile(join(targetDir, file.path), file.content);
        } else if (file.path.includes('/api/')) {
            writeFile(join(targetDir, 'pages', 'api', file.path), file.content);
        } else {
            writeFile(join(targetDir, file.path), file.content);
        }
    }

    return { success: true, files: generatedFiles.length };
}

/**
 * Merge code for Express projects
 */
function mergeExpressCode(generatedFiles, frameworkInfo, targetDir) {
    const serverFilePath = join(targetDir, frameworkInfo.entryPoint);

    // Collect route files
    const routes = [];

    for (const file of generatedFiles) {
        if (file.path.includes('/routes/')) {
            routes.push(file);
            writeFile(join(targetDir, file.path), file.content);
        } else {
            writeFile(join(targetDir, file.path), file.content);
        }
    }

    // Update server.js with route imports and registrations
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
        writeFile(join(targetDir, file.path), file.content);
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

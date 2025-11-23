/**
 * Module Loader
 * Loads and caches .compose modules with dependency tracking
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { compile } from '../index.js';

export class ModuleLoader {
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.cache = new Map(); // path -> { ast, ir, symbolTable, dependencies }
        this.loading = new Set(); // Track currently loading modules for circular detection
    }

    /**
     * Load a module and its dependencies
     * @param {string} modulePath - Path to .compose file
     * @param {string} fromFile - File that imported this module (for relative resolution)
     * @returns {object} - Module info with AST, IR, and symbol table
     */
    loadModule(modulePath, fromFile = null) {
        // Resolve path
        const resolvedPath = this.resolvePath(modulePath, fromFile);

        // Check cache
        if (this.cache.has(resolvedPath)) {
            return this.cache.get(resolvedPath);
        }

        // Check for circular imports
        if (this.loading.has(resolvedPath)) {
            throw new Error(`Circular import detected: ${resolvedPath}`);
        }

        // Mark as loading
        this.loading.add(resolvedPath);

        try {
            // Load and compile module (WITHOUT loading imports to prevent recursion)
            const source = this.readModule(resolvedPath);
            const result = compile(source, resolvedPath, { loadImports: false });

            if (!result.success) {
                const errors = result.errors.map(e => `${e.type}: ${e.message}`).join('\n');
                throw new Error(`Failed to compile ${resolvedPath}:\n${errors}`);
            }

            // Extract dependencies (imports)
            const dependencies = this.extractDependencies(result.ast);

            // Store in cache
            const moduleInfo = {
                path: resolvedPath,
                ast: result.ast,
                ir: result.ir,
                symbolTable: result.symbolTable,
                dependencies
            };

            this.cache.set(resolvedPath, moduleInfo);

            // Load dependencies recursively
            for (const dep of dependencies) {
                this.loadModule(dep, resolvedPath);
            }

            return moduleInfo;
        } finally {
            // Remove from loading set
            this.loading.delete(resolvedPath);
        }
    }

    /**
   * Resolve module path relative to importing file
   */
    resolvePath(modulePath, fromFile) {
        // Add .compose extension if missing
        if (!modulePath.endsWith('.compose')) {
            modulePath = modulePath + '.compose';
        }

        // If absolute or starts with ./, resolve relative to fromFile
        if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
            if (!fromFile) {
                return resolve(this.baseDir, modulePath);
            }
            const dir = dirname(fromFile);
            return resolve(dir, modulePath);
        }

        // Otherwise, try resolving in src directory
        const srcPath = resolve(this.baseDir, 'src', modulePath);
        if (existsSync(srcPath)) {
            return srcPath;
        }

        // Fall back to base directory
        return resolve(this.baseDir, modulePath);
    }

    /**
     * Read module file
     */
    readModule(path) {
        if (!existsSync(path)) {
            throw new Error(`Module not found: ${path}`);
        }

        return readFileSync(path, 'utf8');
    }

    /**
     * Extract import statements from AST
     */
    extractDependencies(ast) {
        const dependencies = [];

        for (const statement of ast.statements) {
            if (statement.type === 'ImportStatement') {
                dependencies.push(statement.path);
            }
        }

        return dependencies;
    }

    /**
     * Get all loaded modules
     */
    getAllModules() {
        return Array.from(this.cache.values());
    }

    /**
     * Get module by path
     */
    getModule(path) {
        return this.cache.get(path);
    }

    /**
     * Build topological order for modules
     * Returns modules in dependency order (dependencies first)
     */
    getTopologicalOrder() {
        const modules = this.getAllModules();
        const visited = new Set();
        const order = [];

        const visit = (module) => {
            if (visited.has(module.path)) return;

            visited.add(module.path);

            // Visit dependencies first
            for (const depPath of module.dependencies) {
                const resolvedDep = this.resolvePath(depPath, module.path);
                const depModule = this.cache.get(resolvedDep);
                if (depModule) {
                    visit(depModule);
                }
            }

            // Then add this module
            order.push(module);
        };

        // Visit all modules
        for (const module of modules) {
            visit(module);
        }

        return order;
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.loading.clear();
    }
}

/**
 * Create a module loader
 */
export function createModuleLoader(baseDir) {
    return new ModuleLoader(baseDir);
}

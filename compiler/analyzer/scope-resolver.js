/**
 * Scope Resolver (Simplified for v0.2.0)
 * Handles module imports - features/guides don't participate in scope
 */

export class ScopeResolver {
    constructor() {
        this.modules = new Map(); // path -> AST
        this.dependencies = new Map(); // path -> Set<dependencies>
        this.errors = [];
    }

    /**
     * Register a module and its imports
     * @param {string} modulePath - Module path
     * @param {Program} ast - Module AST
     */
    registerModule(modulePath, ast) {
        this.modules.set(modulePath, ast);

        // Extract imports - they can be in models, features, or guides arrays
        // but typically imports are separate ImportDeclaration nodes
        const imports = [];

        // Check for import declarations in models array
        if (ast.models) {
            for (const item of ast.models) {
                if (item.type === 'ImportDeclaration') {
                    imports.push(item.path);
                }
            }
        }

        this.dependencies.set(modulePath, new Set(imports));
    }

    /**
     * Get all imports for a module
     * @param {string} modulePath
     * @returns {Set<string>} - Set of imported module paths
     */
    getImports(modulePath) {
        return this.dependencies.get(modulePath) || new Set();
    }

    /**
     * Check for circular dependencies
     * @param {string} modulePath - Starting module
     * @returns {string[]|null} - Circular path if found, null otherwise
     */
    detectCircularDependency(modulePath, visited = new Set(), path = []) {
        if (visited.has(modulePath)) {
            // Found a cycle
            const cycleStart = path.indexOf(modulePath);
            if (cycleStart !== -1) {
                return [...path.slice(cycleStart), modulePath];
            }
            return null;
        }

        visited.add(modulePath);
        path.push(modulePath);

        const imports = this.getImports(modulePath);
        for (const importPath of imports) {
            const cycle = this.detectCircularDependency(importPath, new Set(visited), [...path]);
            if (cycle) {
                return cycle;
            }
        }

        return null;
    }

    /**
     * Get errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Add error
     */
    addError(message, location) {
        this.errors.push({
            message,
            location,
            type: 'ScopeError'
        });
    }
}

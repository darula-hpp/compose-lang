/**
 * Scope Resolver for handling imports and module dependencies
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

        // Extract imports
        const imports = ast.statements
            .filter(stmt => stmt.type === 'ImportStatement')
            .map(stmt => stmt.path);

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
     * Validate all modules for circular dependencies
     * @returns {boolean} - true if valid
     */
    validateNoCycles() {
        for (const modulePath of this.modules.keys()) {
            const cycle = this.detectCircularDependency(modulePath);
            if (cycle) {
                this.addError(
                    `Circular dependency detected: ${cycle.join(' -> ')}`,
                    { file: modulePath, line: 0, column: 0 }
                );
                return false;
            }
        }
        return true;
    }

    /**
     * Get dependency order (topological sort)
     * @returns {string[]} - Modules in dependency order
     */
    getDependencyOrder() {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = (modulePath) => {
            if (visited.has(modulePath)) return;
            if (visiting.has(modulePath)) {
                throw new Error(`Circular dependency involving ${modulePath}`);
            }

            visiting.add(modulePath);

            const imports = this.getImports(modulePath);
            for (const importPath of imports) {
                if (this.modules.has(importPath)) {
                    visit(importPath);
                }
            }

            visiting.delete(modulePath);
            visited.add(modulePath);
            sorted.push(modulePath);
        };

        for (const modulePath of this.modules.keys()) {
            visit(modulePath);
        }

        return sorted;
    }

    /**
     * Add an error
     */
    addError(message, location) {
        this.errors.push({
            message,
            location,
            type: 'ScopeError'
        });
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Check if there are errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }
}

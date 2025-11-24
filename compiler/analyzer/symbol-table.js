/**
 * Symbol Table for tracking defined symbols across scopes
 * Manages models, features, guides, and their visibility
 */

export class SymbolTable {
    constructor(parent = null) {
        this.parent = parent;
        this.symbols = new Map(); // name -> Symbol
        this.types = new Map(); // type name -> type definition
        this.children = []; // child scopes
    }

    /**
     * Define a new symbol in this scope
     * @param {string} name - Symbol name
     * @param {Symbol} symbol - Symbol object
     * @throws {Error} if symbol already exists in this scope
     */
    define(name, symbol) {
        if (this.symbols.has(name)) {
            throw new Error(
                `Duplicate definition of '${name}' at ${symbol.location.file}:${symbol.location.line}`
            );
        }
        this.symbols.set(name, symbol);
    }

    /**
     * Define a new type in this scope
     * @param {string} name - Type name
     * @param {object} typeDef - Type definition
     * @throws {Error} if type already exists in this scope
     */
    defineType(name, typeDef) {
        if (this.types.has(name)) {
            throw new Error(
                `Duplicate type definition of '${name}' at ${typeDef.location.file}:${typeDef.location.line}`
            );
        }
        this.types.set(name, typeDef);
    }

    /**
     * Look up a symbol in this scope or parent scopes
     * @param {string} name - Symbol name to find
     * @returns {Symbol|null} - Symbol if found, null otherwise
     */
    lookup(name) {
        if (this.symbols.has(name)) {
            return this.symbols.get(name);
        }
        if (this.parent) {
            return this.parent.lookup(name);
        }
        return null;
    }

    /**
     * Look up a type in this scope or parent scopes
     * @param {string} name - Type name to find
     * @returns {object|null} - Type definition if found, null otherwise
     */
    lookupType(name) {
        // Check primitive types first
        if (isPrimitiveType(name)) {
            return { kind: 'primitive', name };
        }

        if (this.types.has(name)) {
            return this.types.get(name);
        }
        if (this.parent) {
            return this.parent.lookupType(name);
        }
        return null;
    }

    /**
     * Check if a symbol exists in current scope only (not parents)
     * @param {string} name - Symbol name
     * @returns {boolean}
     */
    hasOwn(name) {
        return this.symbols.has(name);
    }

    /**
     * Create a child scope
     * @returns {SymbolTable} - New child scope
     */
    createChild() {
        const child = new SymbolTable(this);
        this.children.push(child);
        return child;
    }

    /**
     * Get all symbols in this scope (not including parents)
     * @returns {Map<string, Symbol>}
     */
    getOwnSymbols() {
        return new Map(this.symbols);
    }

    /**
     * Get all types in this scope (not including parents)
     * @returns {Map<string, object>}
     */
    getOwnTypes() {
        return new Map(this.types);
    }
}

/**
 * Symbol class representing a defined symbol
 */
export class Symbol {
    constructor(name, kind, type, location, node = null) {
        this.name = name;
        this.kind = kind; // 'model', 'feature', 'guide'
        this.type = type; // Type information
        this.location = location; // { file, line, column }
        this.node = node; // Reference to AST node
    }
}

/**
 * Check if a type name is a primitive type
 */
export function isPrimitiveType(name) {
    const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];
    return primitives.includes(name);
}

/**
 * Create a global symbol table with primitive types
 */
export function createGlobalSymbolTable() {
    const global = new SymbolTable();

    // Define primitive types (v0.2.0)
    const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];
    primitives.forEach(name => {
        global.defineType(name, { kind: 'primitive', name });
    });

    return global;
}


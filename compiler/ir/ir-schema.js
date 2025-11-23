/**
 * IR Schema and type serialization utilities
 * Defines the ComposeIR JSON format
 */

/**
 * Serialize a type node to IR format
 * @param {TypeNode|ListTypeNode} typeNode - AST type node
 * @returns {string|object} - IR type representation
 */
export function serializeType(typeNode) {
    if (!typeNode) {
        return null;
    }

    // Handle list types
    if (typeNode.type === 'ListTypeNode') {
        return {
            kind: 'list',
            of: serializeType(typeNode.elementType)
        };
    }

    // Handle regular types (primitive or custom)
    return typeNode.name;
}

/**
 * Serialize location metadata
 * @param {object} location - AST location
 * @returns {object} - IR location
 */
export function serializeLocation(location) {
    if (!location) {
        return null;
    }

    return {
        line: location.line,
        column: location.column,
        file: location.file
    };
}

/**
 * Generate content hash for a string
 * @param {string} content - Content to hash
 * @returns {string} - Hash string
 */
export function generateHash(content) {
    // Simple hash function (for production, use crypto)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Create an empty IR module structure
 * @param {string} modulePath - Module path
 * @param {string} hash - Content hash
 * @returns {object} - Empty IR module
 */
export function createEmptyIR(modulePath, hash) {
    return {
        version: '1.0',
        module: modulePath,
        hash: hash,
        imports: [],
        structures: [],
        variables: [],
        functions: [],
        frontend: {
            pages: [],
            components: [],
            state: [],
            renders: [],
            themes: []
        },
        backend: {
            env: [],
            files: {
                reads: [],
                writes: []
            },
            apis: [],
            queries: [],
            connections: [],
            sockets: []
        },
        context: []
    };
}

/**
 * Validate IR structure matches specification
 * @param {object} ir - IR object to validate
 * @returns {boolean} - True if valid
 */
export function validateIR(ir) {
    // Check required top-level fields
    const requiredFields = ['version', 'module', 'hash', 'imports', 'structures',
        'variables', 'functions', 'frontend', 'backend', 'context'];

    for (const field of requiredFields) {
        if (!(field in ir)) {
            throw new Error(`IR missing required field: ${field}`);
        }
    }

    // Check frontend structure
    const frontendFields = ['pages', 'components', 'state', 'renders', 'themes'];
    for (const field of frontendFields) {
        if (!(field in ir.frontend)) {
            throw new Error(`IR.frontend missing required field: ${field}`);
        }
    }

    // Check backend structure
    const backendFields = ['env', 'files', 'apis', 'queries', 'connections', 'sockets'];
    for (const field of backendFields) {
        if (!(field in ir.backend)) {
            throw new Error(`IR.backend missing required field: ${field}`);
        }
    }

    // Check backend.files structure
    if (!('reads' in ir.backend.files) || !('writes' in ir.backend.files)) {
        throw new Error('IR.backend.files must have reads and writes arrays');
    }

    return true;
}

/**
 * Semantic Validator
 * Enforces semantic rules and constraints for Compose programs
 */

export class SemanticValidator {
    constructor(symbolTable) {
        this.symbolTable = symbolTable;
        this.errors = [];
    }

    /**
     * Validate that frontend doesn't reference backend
     * @param {Program} ast
     */
    validateFrontendBackendSeparation(ast) {
        const backendSymbols = new Set();
        const frontendRefs = [];

        // Collect backend symbols
        for (const stmt of ast.statements) {
            if (this.isBackendNode(stmt)) {
                if (stmt.name) {
                    backendSymbols.add(stmt.name);
                }
            }
        }

        // Check frontend doesn't reference backend
        for (const stmt of ast.statements) {
            if (this.isFrontendNode(stmt)) {
                const refs = this.getReferences(stmt);
                for (const ref of refs) {
                    if (backendSymbols.has(ref)) {
                        this.addError(
                            `Frontend component references backend symbol '${ref}'`,
                            stmt.location
                        );
                    }
                }
            }
        }
    }

    /**
     * Check if node is a frontend node
     */
    isFrontendNode(node) {
        return node.type === 'FrontendPage' ||
            node.type === 'FrontendComponent' ||
            node.type === 'FrontendState' ||
            node.type === 'FrontendRender' ||
            node.type === 'FrontendTheme';
    }

    /**
     * Check if node is a backend node
     */
    isBackendNode(node) {
        return node.type === 'BackendAPI' ||
            node.type === 'BackendQuery' ||
            node.type === 'BackendReadEnv' ||
            node.type === 'BackendReadFile' ||
            node.type === 'BackendSaveFile' ||
            node.type === 'BackendConnect' ||
            node.type === 'BackendEmit';
    }

    /**
     * Get all symbol references from a node
     */
    getReferences(node) {
        const refs = [];

        // Extract type references
        if (node.props) {
            for (const prop of node.props) {
                if (prop.paramType) {
                    this.extractTypeRefs(prop.paramType, refs);
                }
            }
        }

        if (node.parameters) {
            for (const param of node.parameters) {
                if (param.paramType) {
                    this.extractTypeRefs(param.paramType, refs);
                }
            }
        }

        if (node.returnType) {
            this.extractTypeRefs(node.returnType, refs);
        }

        if (node.varType) {
            this.extractTypeRefs(node.varType, refs);
        }

        return refs;
    }

    /**
     * Extract type references recursively
     */
    extractTypeRefs(typeNode, refs) {
        if (!typeNode) return;

        if (typeNode.type === 'ListTypeNode') {
            this.extractTypeRefs(typeNode.elementType, refs);
        } else if (typeNode.name) {
            refs.push(typeNode.name);
        }
    }

    /**
     * Validate that all referenced types exist
     * @param {Program} ast
     */
    validateAllTypesExist(ast) {
        for (const stmt of ast.statements) {
            const refs = this.getReferences(stmt);
            for (const ref of refs) {
                const typeDef = this.symbolTable.lookupType(ref);
                if (!typeDef) {
                    this.addError(
                        `Undefined type '${ref}'`,
                        stmt.location
                    );
                }
            }
        }
    }

    /**
     * Validate no duplicate top-level definitions
     * @param {Program} ast
     */
    validateNoDuplicates(ast) {
        const defined = new Set();

        for (const stmt of ast.statements) {
            let name = null;

            if (stmt.type === 'StructureDefinition') {
                name = stmt.name;
            } else if (stmt.type === 'VariableDefinition') {
                name = stmt.name;
            } else if (stmt.type === 'FunctionDefinition') {
                name = stmt.name;
            }

            if (name) {
                if (defined.has(name)) {
                    this.addError(
                        `Duplicate definition of '${name}'`,
                        stmt.location
                    );
                }
                defined.add(name);
            }
        }
    }

    /**
     * Validate function descriptions are present
     * @param {Program} ast
     */
    validateFunctionDescriptions(ast) {
        for (const stmt of ast.statements) {
            if (stmt.type === 'FunctionDefinition') {
                if (!stmt.description || stmt.description.trim() === '') {
                    this.addError(
                        `Function '${stmt.name}' missing description`,
                        stmt.location
                    );
                }
            }
        }
    }

    /**
     * Validate API and query descriptions
     * @param {Program} ast
     */
    validateBackendDescriptions(ast) {
        for (const stmt of ast.statements) {
            if (stmt.type === 'BackendAPI' || stmt.type === 'BackendQuery') {
                if (!stmt.description || stmt.description.trim() === '') {
                    this.addError(
                        `${stmt.type === 'BackendAPI' ? 'API' : 'Query'} '${stmt.name}' missing description`,
                        stmt.location
                    );
                }
            }
        }
    }

    /**
     * Add a validation error
     */
    addError(message, location) {
        this.errors.push({
            message,
            location,
            type: 'ValidationError'
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

    /**
     * Clear errors
     */
    clearErrors() {
        this.errors = [];
    }
}

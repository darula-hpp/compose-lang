/**
 * Semantic Validator (Simplified for v0.2.0)
 * Features and guides are natural language - no validation needed!
 * Only validates model-related semantics
 */

export class SemanticValidator {
    constructor(symbolTable) {
        this.symbolTable = symbolTable;
        this.errors = [];
    }

    /**
     * Validate no duplicate model names
     * @param {Program} ast
     */
    validateNoDuplicates(ast) {
        const defined = new Set();

        for (const model of ast.models) {
            if (model.type !== 'ModelDeclaration') continue;

            if (defined.has(model.name)) {
                this.addError(
                    `Duplicate model definition: '${model.name}'`,
                    model.location
                );
            }
            defined.add(model.name);
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

/**
 * Type Checker (Simplified for v0.2.0)
 * Only validates model field types - features and guides are natural language
 */

import { Symbol } from './symbol-table.js';
import { ModelDeclaration } from '../parser/ast-nodes.js';

const PRIMITIVE_TYPES = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];

export class TypeChecker {
    constructor(symbolTable) {
        this.symbolTable = symbolTable;
        this.errors = [];
    }

    /**
     * Validate a model's field types
     * @param {ModelDeclaration} node
     */
    validateModel(node) {
        // Check all field types exist
        for (const field of node.fields) {
            this.validateFieldType(field, node.name);
        }

        // Check for duplicate field names
        const fieldNames = new Set();
        for (const field of node.fields) {
            if (fieldNames.has(field.name)) {
                this.addError(
                    `Duplicate field '${field.name}' in model '${node.name}'`,
                    field.location || node.location
                );
            }
            fieldNames.add(field.name);
        }
    }

    /**
     * Validate a field's type
     */
    validateFieldType(field, modelName) {
        const fieldType = field.fieldType;
        if (!fieldType) return;

        // Get base type (for list of X, get X)
        let baseType = fieldType.baseType;

        // Skip validation for enum types (they have enumValues)
        if (fieldType.enumValues && fieldType.enumValues.length > 0) {
            return;
        }

        // Skip primitive types
        if (PRIMITIVE_TYPES.includes(baseType)) {
            return;
        }

        // Check if the referenced model exists
        const typeDef = this.symbolTable.lookupType(baseType);
        if (!typeDef) {
            this.addError(
                `Model '${modelName}' field '${field.name}' references undefined type '${baseType}'`,
                field.location || { line: 0, column: 0 }
            );
        }
    }

    /**
     * Add a type error
     */
    addError(message, location) {
        this.errors.push({
            message,
            location,
            type: 'TypeError'
        });
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Check if there are any errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = [];
    }
}

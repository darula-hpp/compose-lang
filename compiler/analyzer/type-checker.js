/**
 * Type Checker for validating type compatibility and references
 */

import { isPrimitiveType } from './symbol-table.js';

export class TypeChecker {
    constructor(symbolTable) {
        this.symbolTable = symbolTable;
        this.errors = [];
    }

    /**
     * Validate a type node
     * @param {TypeNode|ListTypeNode} typeNode - Type AST node
     * @param {object} location - Location context for errors
     * @returns {boolean} - true if valid
     */
    validateType(typeNode, location) {
        if (!typeNode) {
            return true; // Nullable type (e.g., explained variables)
        }

        // Handle list types
        if (typeNode.type === 'ListTypeNode') {
            return this.validateType(typeNode.elementType, location);
        }

        // Handle regular types
        const typeName = typeNode.name;

        // Check if type exists
        const typeDef = this.symbolTable.lookupType(typeName);
        if (!typeDef) {
            this.addError(
                `Undefined type '${typeName}'`,
                location
            );
            return false;
        }

        return true;
    }

    /**
     * Check if two types are compatible
     * @param {TypeNode} expected - Expected type
     * @param {TypeNode} actual - Actual type
     * @returns {boolean} - true if compatible
     */
    isCompatible(expected, actual) {
        if (!expected || !actual) {
            return true; // If either is null, skip check
        }

        // Handle list types
        if (expected.type === 'ListTypeNode' && actual.type === 'ListTypeNode') {
            return this.isCompatible(expected.elementType, actual.elementType);
        }

        if (expected.type === 'ListTypeNode' || actual.type === 'ListTypeNode') {
            return false; // One is list, other is not
        }

        // Simple name comparison
        return expected.name === actual.name;
    }

    /**
     * Validate a structure definition
     * @param {StructureDefinition} node
     */
    validateStructure(node) {
        // Check all field types exist
        for (const field of node.fields) {
            this.validateType(field.fieldType, field.location);
        }

        // Check for duplicate field names
        const fieldNames = new Set();
        for (const field of node.fields) {
            if (fieldNames.has(field.name)) {
                this.addError(
                    `Duplicate field '${field.name}' in structure '${node.name}'`,
                    field.location
                );
            }
            fieldNames.add(field.name);
        }
    }

    /**
     * Validate a function definition
     * @param {FunctionDefinition} node
     */
    validateFunction(node) {
        // Check parameter types
        for (const param of node.parameters) {
            this.validateType(param.paramType, param.location);
        }

        // Check return type
        if (node.returnType) {
            this.validateType(node.returnType, node.location);
        }

        // Check for duplicate parameter names
        const paramNames = new Set();
        for (const param of node.parameters) {
            if (paramNames.has(param.name)) {
                this.addError(
                    `Duplicate parameter '${param.name}' in function '${node.name}'`,
                    param.location
                );
            }
            paramNames.add(param.name);
        }
    }

    /**
     * Validate a variable definition
     * @param {VariableDefinition} node
     */
    validateVariable(node) {
        // Only validate if it has a type (not an explained variable)
        if (node.varType) {
            this.validateType(node.varType, node.location);
        }
    }

    /**
     * Validate frontend component props
     * @param {FrontendComponent} node
     */
    validateComponent(node) {
        // Check prop types
        for (const prop of node.props) {
            this.validateType(prop.paramType, prop.location);
        }

        // Check for duplicate prop names
        const propNames = new Set();
        for (const prop of node.props) {
            if (propNames.has(prop.name)) {
                this.addError(
                    `Duplicate prop '${prop.name}' in component '${node.name}'`,
                    prop.location
                );
            }
            propNames.add(prop.name);
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

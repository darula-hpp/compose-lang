/**
 * IR Builder
 * Transforms AST nodes into ComposeIR JSON format
 */

import {
    serializeType,
    serializeLocation,
    generateHash,
    createEmptyIR,
    validateIR
} from './ir-schema.js';

export class IRBuilder {
    constructor() {
        this.ir = null;
        this.modulePath = null;
    }

    /**
     * Build IR from AST
     * @param {Program} ast - AST root node
     * @param {string} modulePath - Module path
     * @param {string} sourceCode - Original source code (for hashing)
     * @returns {object} - ComposeIR JSON
     */
    build(ast, modulePath = '<input>', sourceCode = '') {
        this.modulePath = modulePath;
        const hash = generateHash(sourceCode);
        this.ir = createEmptyIR(modulePath, hash);

        // Process all statements
        for (const stmt of ast.statements) {
            this.processStatement(stmt);
        }

        // Validate IR structure
        validateIR(this.ir);

        return this.ir;
    }

    /**
     * Process a single statement
     */
    processStatement(stmt) {
        switch (stmt.type) {
            case 'ImportStatement':
                this.processImport(stmt);
                break;
            case 'ContextComment':
                this.processContextComment(stmt);
                break;
            case 'StructureDefinition':
                this.processStructure(stmt);
                break;
            case 'VariableDefinition':
                this.processVariable(stmt);
                break;
            case 'FunctionDefinition':
                this.processFunction(stmt);
                break;
            case 'FrontendPage':
                this.processFrontendPage(stmt);
                break;
            case 'FrontendComponent':
                this.processFrontendComponent(stmt);
                break;
            case 'FrontendState':
                this.processFrontendState(stmt);
                break;
            case 'FrontendRender':
                this.processFrontendRender(stmt);
                break;
            case 'FrontendTheme':
                this.processFrontendTheme(stmt);
                break;
            case 'BackendReadEnv':
                this.processBackendReadEnv(stmt);
                break;
            case 'BackendReadFile':
                this.processBackendReadFile(stmt);
                break;
            case 'BackendSaveFile':
                this.processBackendSaveFile(stmt);
                break;
            case 'BackendAPI':
                this.processBackendAPI(stmt);
                break;
            case 'BackendQuery':
                this.processBackendQuery(stmt);
                break;
            case 'BackendConnect':
                this.processBackendConnect(stmt);
                break;
            case 'BackendEmit':
                this.processBackendEmit(stmt);
                break;
        }
    }

    // ==================== Import & Context ====================

    processImport(node) {
        this.ir.imports.push(node.path);
    }

    processContextComment(node) {
        this.ir.context.push(node.text);
    }

    // ==================== Data Definitions ====================

    processStructure(node) {
        const fields = node.fields.map(field => ({
            name: field.name,
            type: serializeType(field.fieldType)
        }));

        this.ir.structures.push({
            name: node.name,
            fields: fields,
            location: serializeLocation(node.location)
        });
    }

    processVariable(node) {
        const variable = {
            name: node.name,
            type: node.varType ? serializeType(node.varType) : null,
            explanation: node.explanation,
            location: serializeLocation(node.location)
        };

        this.ir.variables.push(variable);
    }

    processFunction(node) {
        const inputs = node.parameters.map(param => ({
            name: param.name,
            type: serializeType(param.paramType)
        }));

        this.ir.functions.push({
            name: node.name,
            inputs: inputs,
            returns: serializeType(node.returnType),
            description: node.description,
            location: serializeLocation(node.location)
        });
    }

    // ==================== Frontend ====================

    processFrontendPage(node) {
        this.ir.frontend.pages.push({
            name: node.name,
            protected: node.isProtected,
            description: node.description,
            location: serializeLocation(node.location)
        });
    }

    processFrontendComponent(node) {
        const props = node.props.map(prop => ({
            name: prop.name,
            type: serializeType(prop.paramType)
        }));

        this.ir.frontend.components.push({
            name: node.name,
            props: props,
            description: node.description,
            location: serializeLocation(node.location)
        });
    }

    processFrontendState(node) {
        this.ir.frontend.state.push({
            name: node.name,
            explanation: node.explanation,
            location: serializeLocation(node.location)
        });
    }

    processFrontendRender(node) {
        this.ir.frontend.renders.push({
            target: node.target,
            description: node.description,
            location: serializeLocation(node.location)
        });
    }

    processFrontendTheme(node) {
        this.ir.frontend.themes.push({
            name: node.name,
            properties: node.properties,
            location: serializeLocation(node.location)
        });
    }

    // ==================== Backend ====================

    processBackendReadEnv(node) {
        this.ir.backend.env.push({
            name: node.varName,
            location: serializeLocation(node.location)
        });
    }

    processBackendReadFile(node) {
        this.ir.backend.files.reads.push(node.path);
    }

    processBackendSaveFile(node) {
        this.ir.backend.files.writes.push(node.path);
    }

    processBackendAPI(node) {
        this.ir.backend.apis.push({
            name: node.name,
            description: node.description,
            location: serializeLocation(node.location)
        });
    }

    processBackendQuery(node) {
        this.ir.backend.queries.push({
            name: node.name,
            description: node.description,
            location: serializeLocation(node.location)
        });
    }

    processBackendConnect(node) {
        this.ir.backend.connections.push({
            name: node.name,
            config: node.config,
            location: serializeLocation(node.location)
        });
    }

    processBackendEmit(node) {
        this.ir.backend.sockets.push({
            event: node.event,
            description: node.description,
            location: serializeLocation(node.location)
        });
    }
}

/**
 * Build IR from AST (convenience function)
 * @param {Program} ast - AST root node
 * @param {string} modulePath - Module path
 * @param {string} sourceCode - Original source code
 * @returns {object} - ComposeIR JSON
 */
export function buildIR(ast, modulePath = '<input>', sourceCode = '') {
    const builder = new IRBuilder();
    return builder.build(ast, modulePath, sourceCode);
}

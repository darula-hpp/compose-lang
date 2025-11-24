/**
 * Semantic Analyzer
 * Simplified for three-keyword architecture (model, feature, guide)
 * Handles import resolution and model type checking
 */

import { createGlobalSymbolTable, Symbol } from './symbol-table.js';
import { createModuleLoader } from '../loader/index.js';

export class SemanticAnalyzer {
    constructor(options = {}) {
        this.symbolTable = createGlobalSymbolTable();
        this.errors = [];
        this.baseDir = options.baseDir || process.cwd();
        this.loadImports = options.loadImports !== false;
    }

    /**
     * Analyze a program AST
     * @param {Program} ast - AST to analyze
     * @param {string} modulePath - Module path for this AST
     * @returns {object} - Analysis result with errors
     */
    analyze(ast, modulePath = '<input>') {
        this.errors = [];

        try {
            // Check if there are imports that need resolution
            const hasImports = ast.models.some(m => m.type === 'ImportDeclaration') ||
                ast.features.some(f => f.type === 'ImportDeclaration') ||
                ast.guides.some(g => g.type === 'ImportDeclaration');

            if (this.loadImports && hasImports) {
                return this.analyzeWithImports(ast, modulePath);
            }

            // Otherwise, single file analysis
            return this.analyzeSingleFile(ast, modulePath);
        } catch (error) {
            this.errors.push({
                message: error.message,
                location: { file: modulePath, line: 0, column: 0 },
                type: 'AnalysisError'
            });

            return {
                success: false,
                errors: this.errors,
                symbolTable: this.symbolTable
            };
        }
    }

    /**
     * Analyze with import resolution
     */
    analyzeWithImports(ast, modulePath) {
        const moduleLoader = createModuleLoader(this.baseDir);

        // Load this module and all its dependencies
        moduleLoader.loadModule(modulePath, null);

        // Get modules in dependency order (dependencies first)
        const orderedModules = moduleLoader.getTopologicalOrder();

        // Analyze dependencies first to populate their symbol tables
        for (const module of orderedModules) {
            if (module.path !== modulePath) {
                // Create a temporary analyzer to build the dependency's symbol table
                const depAnalyzer = new SemanticAnalyzer({
                    baseDir: this.baseDir,
                    loadImports: false
                });
                depAnalyzer.buildSymbolTable(module.ast);
                module.symbolTable = depAnalyzer.symbolTable;
            }
        }

        // Import symbols from all dependency modules
        for (const module of orderedModules) {
            if (module.path !== modulePath && module.symbolTable) {
                this.importSymbolsFrom(module.symbolTable);
            }
        }

        // Now analyze the main module
        return this.analyzeSingleFile(ast, modulePath);
    }

    /**
     * Import symbols from another module's symbol table
     */
    importSymbolsFrom(sourceTable) {
        if (!sourceTable) return;

        // Import model types
        if (sourceTable.types && sourceTable.types.entries) {
            for (const [name, typeDef] of sourceTable.types.entries()) {
                if (!this.symbolTable.types.has(name)) {
                    this.symbolTable.types.set(name, typeDef);
                }
            }
        }

        // Import model symbols
        if (sourceTable.symbols && sourceTable.symbols.entries) {
            for (const [name, symbol] of sourceTable.symbols.entries()) {
                if (symbol.kind === 'model' && !this.symbolTable.symbols.has(name)) {
                    this.symbolTable.symbols.set(name, symbol);
                }
            }
        }
    }

    /**
     * Analyze a single file (no imports)
     */
    analyzeSingleFile(ast, modulePath) {
        // Phase 1: Build symbol table (register all models)
        this.buildSymbolTable(ast);

        // Phase 2: Validate model references
        this.validateModelReferences(ast);

        // Phase 3: Check for duplicates
        this.checkDuplicates(ast);

        return {
            success: this.errors.length === 0,
            errors: this.errors,
            symbolTable: this.symbolTable
        };
    }

    /**
     * Build symbol table from AST
     */
    buildSymbolTable(ast) {
        // Register all models
        for (const model of ast.models) {
            if (model.type === 'ModelDeclaration') {
                this.registerModel(model);
            }
        }
    }

    /**
     * Register a model in the symbol table
     */
    registerModel(node) {
        // Check if already defined
        if (this.symbolTable.symbols.has(node.name)) {
            this.errors.push({
                message: `Model "${node.name}" is already defined`,
                location: node.location,
                type: 'DuplicateDefinition'
            });
            return;
        }

        // Register the model type
        this.symbolTable.defineType(node.name, {
            kind: 'model',
            name: node.name,
            fields: node.fields,
            location: node.location,
            node
        });

        // Also register as a symbol
        this.symbolTable.define(
            node.name,
            new Symbol(node.name, 'model', node.name, node.location, node)
        );
    }

    /**
     * Validate that all model references exist
     */
    validateModelReferences(ast) {
        for (const model of ast.models) {
            if (model.type !== 'ModelDeclaration') continue;

            for (const field of model.fields) {
                const fieldType = field.fieldType;

                // Get the base type (handle list of X)
                let baseType = fieldType.baseType;

                // Skip validation for enum types
                if (fieldType.enumValues && fieldType.enumValues.length > 0) {
                    continue;
                }

                // Skip primitive types
                const primitiveTypes = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];
                if (primitiveTypes.includes(baseType)) {
                    continue;
                }

                // Check if the referenced model exists
                if (!this.symbolTable.types.has(baseType)) {
                    this.errors.push({
                        message: `Model "${model.name}" references undefined type "${baseType}" in field "${field.name}"`,
                        location: field.location || model.location,
                        type: 'UndefinedReference'
                    });
                }
            }
        }
    }

    /**
     * Check for duplicate model names
     */
    checkDuplicates(ast) {
        const seen = new Set();

        for (const model of ast.models) {
            if (model.type !== 'ModelDeclaration') continue;

            if (seen.has(model.name)) {
                this.errors.push({
                    message: `Duplicate model name: "${model.name}"`,
                    location: model.location,
                    type: 'DuplicateDefinition'
                });
            }
            seen.add(model.name);
        }
    }
}

/**
 * Analyze a single AST
 * @param {Program} ast - AST to analyze
 * @param {string} modulePath - Module path
 * @param {object} options - Analysis options
 * @returns {object} - Analysis result
 */
export function analyze(ast, modulePath = '<input>', options = {}) {
    const analyzer = new SemanticAnalyzer(options);
    return analyzer.analyze(ast, modulePath);
}

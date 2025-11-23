/**
 * Semantic Analyzer
 * Main orchestrator for semantic analysis phase
 * Coordinates symbol table, type checking, scope resolution, and validation
 */

import { createGlobalSymbolTable, Symbol } from './symbol-table.js';
import { TypeChecker } from './type-checker.js';
import { ScopeResolver } from './scope-resolver.js';
import { SemanticValidator } from './validator.js';
import { createModuleLoader } from '../loader/index.js';

export class SemanticAnalyzer {
    constructor(options = {}) {
        this.symbolTable = createGlobalSymbolTable();
        this.typeChecker = new TypeChecker(this.symbolTable);
        this.scopeResolver = new ScopeResolver();
        this.validator = new SemanticValidator(this.symbolTable);
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
            // If imports should be loaded, use module loader
            if (this.loadImports && ast.statements.some(s => s.type === 'ImportStatement')) {
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

        // Register all modules with scope resolver
        for (const module of orderedModules) {
            this.scopeResolver.registerModule(module.path, module.ast);
        }

        // Import symbols from all dependency modules (not the main module)
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

        // Import types (if types map exists)
        if (sourceTable.types && sourceTable.types.entries) {
            for (const [name, typeDef] of sourceTable.types.entries()) {
                if (!this.symbolTable.types.has(name)) {
                    this.symbolTable.types.set(name, typeDef);
                }
            }
        }

        // Import structure symbols (if symbols map exists)
        if (sourceTable.symbols && sourceTable.symbols.entries) {
            for (const [name, symbol] of sourceTable.symbols.entries()) {
                if (symbol.kind === 'structure' && !this.symbolTable.symbols.has(name)) {
                    this.symbolTable.symbols.set(name, symbol);
                }
            }
        }
    }

    /**
     * Analyze a single file (no imports)
     */
    analyzeSingleFile(ast, modulePath) {
        // Phase 1: Register module
        this.scopeResolver.registerModule(modulePath, ast);

        // Phase 2: Build symbol table
        this.buildSymbolTable(ast);

        // Phase 3: Type checking
        this.performTypeChecking(ast);

        // Phase 4: Semantic validation
        this.performValidation(ast);

        // Collect all errors
        this.collectErrors();

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
        for (const stmt of ast.statements) {
            switch (stmt.type) {
                case 'StructureDefinition':
                    this.registerStructure(stmt);
                    break;
                case 'VariableDefinition':
                    this.registerVariable(stmt);
                    break;
                case 'FunctionDefinition':
                    this.registerFunction(stmt);
                    break;
            }
        }
    }

    /**
     * Register a structure in the symbol table
     */
    registerStructure(node) {
        // Register the structure type
        this.symbolTable.defineType(node.name, {
            kind: 'structure',
            name: node.name,
            fields: node.fields,
            location: node.location,
            node
        });

        // Also register as a symbol
        this.symbolTable.define(
            node.name,
            new Symbol(node.name, 'structure', node.name, node.location, node)
        );
    }

    /**
     * Register a variable in the symbol table
     */
    registerVariable(node) {
        let typeName = null;

        if (node.varType) {
            if (node.varType.type === 'ListTypeNode') {
                typeName = `list of ${node.varType.elementType.name}`;
            } else {
                typeName = node.varType.name;
            }
        }

        this.symbolTable.define(
            node.name,
            new Symbol(node.name, 'variable', typeName, node.location, node)
        );
    }

    /**
     * Register a function in the symbol table
     */
    registerFunction(node) {
        const returnType = node.returnType ? node.returnType.name : 'void';

        this.symbolTable.define(
            node.name,
            new Symbol(node.name, 'function', returnType, node.location, node)
        );
    }

    /**
     * Perform type checking on all nodes
     */
    performTypeChecking(ast) {
        for (const stmt of ast.statements) {
            switch (stmt.type) {
                case 'StructureDefinition':
                    this.typeChecker.validateStructure(stmt);
                    break;
                case 'VariableDefinition':
                    this.typeChecker.validateVariable(stmt);
                    break;
                case 'FunctionDefinition':
                    this.typeChecker.validateFunction(stmt);
                    break;
                case 'FrontendComponent':
                    this.typeChecker.validateComponent(stmt);
                    break;
            }
        }
    }

    /**
     * Perform semantic validation
     */
    performValidation(ast) {
        this.validator.validateNoDuplicates(ast);
        this.validator.validateFrontendBackendSeparation(ast);
        this.validator.validateAllTypesExist(ast);
        this.validator.validateFunctionDescriptions(ast);
        this.validator.validateBackendDescriptions(ast);
    }

    /**
     * Collect all errors from sub-components
     */
    collectErrors() {
        this.errors = [
            ...this.typeChecker.getErrors(),
            ...this.scopeResolver.getErrors(),
            ...this.validator.getErrors()
        ];
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

/**
 * Main compiler entry point
 * Orchestrates lexer, parser, analyzer, IR generation, and other compilation phases
 */

import { Lexer } from './lexer/index.js';
import { Parser } from './parser/index.js';
import { analyze } from './analyzer/index.js';
import { buildIR } from './ir/index.js';

/**
 * Compile Compose source code to IR with full analysis
 * @param {string} source - Compose source code
 * @param {string} file - Source file path
 * @param {object} options - Compilation options
 * @returns {object} - Compilation result with IR, AST, analysis, and errors
 */
export function compile(source, file = '<input>', options = {}) {
    const skipAnalysis = options.skipAnalysis || false;
    const skipIR = options.skipIR || false;
    const baseDir = options.baseDir || process.cwd();

    try {
        // Phase 1: Lexical analysis
        const lexer = new Lexer(source, file);
        const tokens = lexer.tokenize();

        // Phase 2: Syntax analysis
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Phase 3: Semantic analysis (optional)
        let symbolTable = null;
        if (!skipAnalysis) {
            const analysis = analyze(ast, file, { baseDir, loadImports: options.loadImports });
            symbolTable = analysis.symbolTable;

            if (!analysis.success) {
                return {
                    success: false,
                    ast,
                    ir: null,
                    errors: analysis.errors,
                    symbolTable
                };
            }
        }

        // Phase 4: IR generation (optional)
        let ir = null;
        if (!skipIR && !skipAnalysis) {
            ir = buildIR(ast, file, source);
        }

        return {
            success: true,
            ast,
            ir,
            errors: [],
            symbolTable
        };
    } catch (error) {
        return {
            success: false,
            ast: null,
            ir: null,
            errors: [{
                message: error.message,
                location: { file, line: 0, column: 0 },
                type: 'CompilationError'
            }]
        };
    }
}

/**
 * Compile and return tokens (for debugging/testing)
 */
export function tokenize(source, file = '<input>') {
    const lexer = new Lexer(source, file);
    return lexer.tokenize();
}

/**
 * Export lexer and parser for direct use
 */
export { Lexer } from './lexer/index.js';
export { Parser } from './parser/index.js';
export * from './lexer/token-types.js';
export * from './parser/ast-nodes.js';

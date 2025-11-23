/**
 * Parser for the Compose language
 * Implements a recursive descent parser that builds an AST from tokens
 */

import { TokenType } from '../lexer/token-types.js';
import * as AST from './ast-nodes.js';

export class Parser {
    /**
     * @param {Token[]} tokens - Array of tokens from lexer
     */
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    /**
     * Parse tokens into an AST
     * @returns {Program} - Root AST node
     */
    parse() {
        const statements = [];

        while (!this.isAtEnd()) {
            // Skip newlines at top level
            if (this.check(TokenType.NEWLINE)) {
                this.advance();
                continue;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
        }

        return new AST.Program(statements);
    }

    /**
     * Parse a single statement
     */
    parseStatement() {
        // Context comment
        if (this.check(TokenType.CONTEXT_COMMENT)) {
            return this.parseContextComment();
        }

        // Import
        if (this.check(TokenType.IMPORT)) {
            return this.parseImport();
        }

        // Define
        if (this.check(TokenType.DEFINE)) {
            return this.parseDefine();
        }

        // Frontend
        if (this.checkFrontend()) {
            return this.parseFrontend();
        }

        // Backend
        if (this.checkBackend()) {
            return this.parseBackend();
        }

        this.error(`Unexpected token: ${this.peek().type}`);
    }

    // ==================== Import ====================

    parseImport() {
        const token = this.consume(TokenType.IMPORT, "Expected 'import'");
        const path = this.consume(TokenType.STRING, "Expected string path after 'import'");
        this.consumeNewline();

        return new AST.ImportStatement(path.value, this.loc(token));
    }

    // ==================== Context Comment ====================

    parseContextComment() {
        const token = this.advance();
        this.consumeNewline();
        return new AST.ContextComment(token.value, this.loc(token));
    }

    // ==================== Define ====================

    parseDefine() {
        const token = this.consume(TokenType.DEFINE, "Expected 'define'");

        // define structure
        if (this.check(TokenType.STRUCTURE)) {
            return this.parseStructure(token);
        }

        // define function
        if (this.check(TokenType.FUNCTION)) {
            return this.parseFunction(token);
        }

        // define variable
        return this.parseVariable(token);
    }

    parseStructure(defineToken) {
        this.consume(TokenType.STRUCTURE, "Expected 'structure'");
        const name = this.consume(TokenType.IDENTIFIER, "Expected structure name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after structure definition");

        const fields = [];
        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            this.consume(TokenType.HAS, "Expected 'has' in structure field");
            const fieldName = this.consume(TokenType.IDENTIFIER, "Expected field name");
            this.consume(TokenType.AS, "Expected 'as' after field name");
            const fieldType = this.parseType();
            this.consumeNewline();

            fields.push(new AST.FieldDefinition(fieldName.value, fieldType, this.loc(fieldName)));
        }

        this.consume(TokenType.DEDENT, "Expected dedent after structure fields");

        return new AST.StructureDefinition(name.value, fields, this.loc(defineToken));
    }

    parseFunction(defineToken) {
        this.consume(TokenType.FUNCTION, "Expected 'function'");
        const name = this.consume(TokenType.IDENTIFIER, "Expected function name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after function definition");

        let parameters = [];
        let returnType = null;
        let description = '';

        // Parse function attributes
        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            if (this.check(TokenType.INPUTS)) {
                this.advance();
                this.consume(TokenType.COLON, "Expected ':' after 'inputs'");
                parameters = this.parseParameterList();
                this.consumeNewline();
            } else if (this.check(TokenType.RETURNS)) {
                this.advance();
                this.consume(TokenType.COLON, "Expected ':' after 'returns'");
                returnType = this.parseType();
                this.consumeNewline();
            } else if (this.check(TokenType.DESCRIPTION)) {
                this.advance();
                this.consume(TokenType.COLON, "Expected ':' after 'description'");
                const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
                description = desc.value;
                this.consumeNewline();
            } else {
                this.error("Expected 'inputs', 'returns', or 'description' in function definition");
            }
        }

        this.consume(TokenType.DEDENT, "Expected dedent after function body");

        return new AST.FunctionDefinition(name.value, parameters, returnType, description, this.loc(defineToken));
    }

    parseVariable(defineToken) {
        const name = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        this.consume(TokenType.AS, "Expected 'as' after variable name");

        // Check if it's an explanation (string) or type
        if (this.check(TokenType.STRING)) {
            const explanation = this.advance();
            this.consumeNewline();
            return new AST.VariableDefinition(name.value, null, explanation.value, this.loc(defineToken));
        } else {
            const varType = this.parseType();
            this.consumeNewline();
            return new AST.VariableDefinition(name.value, varType, null, this.loc(defineToken));
        }
    }

    // ==================== Types ====================

    parseType() {
        // list of X
        if (this.check(TokenType.LIST)) {
            this.advance();
            this.consume(TokenType.OF, "Expected 'of' after 'list'");
            const elementType = this.parseType();
            return new AST.ListTypeNode(elementType);
        }

        // Primitive or custom type
        const token = this.advance();

        // Primitive types
        if (token.isOneOf(
            TokenType.TYPE_NUMBER,
            TokenType.TYPE_TEXT,
            TokenType.TYPE_BOOLEAN,
            TokenType.TYPE_DATE,
            TokenType.TYPE_DATETIME,
            TokenType.TYPE_VOID
        )) {
            return new AST.TypeNode(token.value, this.loc(token));
        }

        // Custom type (identifier)
        if (token.is(TokenType.IDENTIFIER)) {
            return new AST.TypeNode(token.value, this.loc(token));
        }

        this.error(`Expected type, got ${token.type}`);
    }

    parseParameterList() {
        const parameters = [];

        // Parse first parameter
        const name = this.consume(TokenType.IDENTIFIER, "Expected parameter name");
        this.consume(TokenType.AS, "Expected 'as' after parameter name");
        const type = this.parseType();
        parameters.push(new AST.Parameter(name.value, type, this.loc(name)));

        // Parse additional parameters
        while (this.check(TokenType.COMMA)) {
            this.advance();
            const paramName = this.consume(TokenType.IDENTIFIER, "Expected parameter name");
            this.consume(TokenType.AS, "Expected 'as' after parameter name");
            const paramType = this.parseType();
            parameters.push(new AST.Parameter(paramName.value, paramType, this.loc(paramName)));
        }

        return parameters;
    }

    // ==================== Frontend ====================

    checkFrontend() {
        return this.peek().isOneOf(
            TokenType.FRONTEND_PAGE,
            TokenType.FRONTEND_COMPONENT,
            TokenType.FRONTEND_STATE,
            TokenType.FRONTEND_RENDER,
            TokenType.FRONTEND_THEME
        );
    }

    parseFrontend() {
        const token = this.peek();

        switch (token.type) {
            case TokenType.FRONTEND_PAGE:
                return this.parseFrontendPage();
            case TokenType.FRONTEND_COMPONENT:
                return this.parseFrontendComponent();
            case TokenType.FRONTEND_STATE:
                return this.parseFrontendState();
            case TokenType.FRONTEND_RENDER:
                return this.parseFrontendRender();
            case TokenType.FRONTEND_THEME:
                return this.parseFrontendTheme();
            default:
                this.error(`Unexpected frontend token: ${token.type}`);
        }
    }

    parseFrontendPage() {
        const token = this.consume(TokenType.FRONTEND_PAGE, "Expected 'frontend.page'");
        const name = this.consume(TokenType.STRING, "Expected page name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after page definition");

        let isProtected = false;
        let description = '';

        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            if (this.check(TokenType.IS)) {
                this.advance();
                this.consume(TokenType.PROTECTED, "Expected 'protected' after 'is'");
                isProtected = true;
                this.consumeNewline();
            } else if (this.check(TokenType.DESCRIPTION)) {
                this.advance();
                this.consume(TokenType.COLON, "Expected ':' after 'description'");
                const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
                description = desc.value;
                this.consumeNewline();
            } else {
                this.error("Expected 'is protected' or 'description' in page definition");
            }
        }

        this.consume(TokenType.DEDENT, "Expected dedent after page body");

        return new AST.FrontendPage(name.value, isProtected, description, this.loc(token));
    }

    parseFrontendComponent() {
        const token = this.consume(TokenType.FRONTEND_COMPONENT, "Expected 'frontend.component'");
        const name = this.consume(TokenType.STRING, "Expected component name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after component definition");

        let props = [];
        let description = '';

        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            if (this.check(TokenType.ACCEPTS)) {
                this.advance();
                const propName = this.consume(TokenType.IDENTIFIER, "Expected prop name");
                this.consume(TokenType.AS, "Expected 'as' after prop name");
                const propType = this.parseType();
                props.push(new AST.Parameter(propName.value, propType, this.loc(propName)));
                this.consumeNewline();
            } else if (this.check(TokenType.DESCRIPTION)) {
                this.advance();
                this.consume(TokenType.COLON, "Expected ':' after 'description'");
                const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
                description = desc.value;
                this.consumeNewline();
            } else {
                this.error("Expected 'accepts' or 'description' in component definition");
            }
        }

        this.consume(TokenType.DEDENT, "Expected dedent after component body");

        return new AST.FrontendComponent(name.value, props, description, this.loc(token));
    }

    parseFrontendState() {
        const token = this.consume(TokenType.FRONTEND_STATE, "Expected 'frontend.state'");
        const name = this.consume(TokenType.IDENTIFIER, "Expected state name");
        this.consume(TokenType.AS, "Expected 'as' after state name");
        const explanation = this.consume(TokenType.STRING, "Expected string explanation");
        this.consumeNewline();

        return new AST.FrontendState(name.value, explanation.value, this.loc(token));
    }

    parseFrontendRender() {
        const token = this.consume(TokenType.FRONTEND_RENDER, "Expected 'frontend.render'");
        const target = this.consume(TokenType.STRING, "Expected render target");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after render definition");
        this.consume(TokenType.DESCRIPTION, "Expected 'description'");
        this.consume(TokenType.COLON, "Expected ':' after 'description'");
        const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
        this.consumeNewline();
        this.consume(TokenType.DEDENT, "Expected dedent after render body");

        return new AST.FrontendRender(target.value, desc.value, this.loc(token));
    }

    parseFrontendTheme() {
        const token = this.consume(TokenType.FRONTEND_THEME, "Expected 'frontend.theme'");
        const name = this.consume(TokenType.STRING, "Expected theme name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after theme definition");

        const properties = {};

        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            const key = this.consume(TokenType.IDENTIFIER, "Expected property name");
            this.consume(TokenType.COLON, "Expected ':' after property name");
            const value = this.consume(TokenType.STRING, "Expected string value");
            properties[key.value] = value.value;
            this.consumeNewline();
        }

        this.consume(TokenType.DEDENT, "Expected dedent after theme body");

        return new AST.FrontendTheme(name.value, properties, this.loc(token));
    }

    // ==================== Backend ====================

    checkBackend() {
        return this.peek().isOneOf(
            TokenType.BACKEND_READ_ENV,
            TokenType.BACKEND_READ_FILE,
            TokenType.BACKEND_SAVE_FILE,
            TokenType.BACKEND_CREATE_API,
            TokenType.BACKEND_QUERY,
            TokenType.BACKEND_CONNECT,
            TokenType.BACKEND_EMIT
        );
    }

    parseBackend() {
        const token = this.peek();

        switch (token.type) {
            case TokenType.BACKEND_READ_ENV:
                return this.parseBackendReadEnv();
            case TokenType.BACKEND_READ_FILE:
                return this.parseBackendReadFile();
            case TokenType.BACKEND_SAVE_FILE:
                return this.parseBackendSaveFile();
            case TokenType.BACKEND_CREATE_API:
                return this.parseBackendAPI();
            case TokenType.BACKEND_QUERY:
                return this.parseBackendQuery();
            case TokenType.BACKEND_CONNECT:
                return this.parseBackendConnect();
            case TokenType.BACKEND_EMIT:
                return this.parseBackendEmit();
            default:
                this.error(`Unexpected backend token: ${token.type}`);
        }
    }

    parseBackendReadEnv() {
        const token = this.consume(TokenType.BACKEND_READ_ENV, "Expected 'backend.read_env'");
        const varName = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        this.consumeNewline();

        return new AST.BackendReadEnv(varName.value, this.loc(token));
    }

    parseBackendReadFile() {
        const token = this.consume(TokenType.BACKEND_READ_FILE, "Expected 'backend.read_file'");
        const path = this.consume(TokenType.STRING, "Expected file path");
        this.consumeNewline();

        return new AST.BackendReadFile(path.value, this.loc(token));
    }

    parseBackendSaveFile() {
        const token = this.consume(TokenType.BACKEND_SAVE_FILE, "Expected 'backend.save_file'");
        const path = this.consume(TokenType.STRING, "Expected file path");
        this.consumeNewline();

        return new AST.BackendSaveFile(path.value, this.loc(token));
    }

    parseBackendAPI() {
        const token = this.consume(TokenType.BACKEND_CREATE_API, "Expected 'backend.create_api'");
        const name = this.consume(TokenType.STRING, "Expected API name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after API definition");
        this.consume(TokenType.DESCRIPTION, "Expected 'description'");
        this.consume(TokenType.COLON, "Expected ':' after 'description'");
        const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
        this.consumeNewline();
        this.consume(TokenType.DEDENT, "Expected dedent after API body");

        return new AST.BackendAPI(name.value, desc.value, this.loc(token));
    }

    parseBackendQuery() {
        const token = this.consume(TokenType.BACKEND_QUERY, "Expected 'backend.query'");
        const name = this.consume(TokenType.STRING, "Expected query name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after query definition");
        this.consume(TokenType.DESCRIPTION, "Expected 'description'");
        this.consume(TokenType.COLON, "Expected ':' after 'description'");
        const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
        this.consumeNewline();
        this.consume(TokenType.DEDENT, "Expected dedent after query body");

        return new AST.BackendQuery(name.value, desc.value, this.loc(token));
    }

    parseBackendConnect() {
        const token = this.consume(TokenType.BACKEND_CONNECT, "Expected 'backend.connect'");
        const name = this.consume(TokenType.STRING, "Expected service name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after connect definition");
        this.consume(TokenType.WITH, "Expected 'with'");

        const config = {};
        const key = this.consume(TokenType.IDENTIFIER, "Expected config key");
        this.consume(TokenType.COLON, "Expected ':' after config key");
        const value = this.consume(TokenType.IDENTIFIER, "Expected config value");
        config[key.value] = value.value;
        this.consumeNewline();
        this.consume(TokenType.DEDENT, "Expected dedent after connect body");

        return new AST.BackendConnect(name.value, config, this.loc(token));
    }

    parseBackendEmit() {
        const token = this.consume(TokenType.BACKEND_EMIT, "Expected 'backend.emit'");
        const event = this.consume(TokenType.STRING, "Expected event name");
        this.consumeNewline();
        this.consume(TokenType.INDENT, "Expected indent after emit definition");
        this.consume(TokenType.DESCRIPTION, "Expected 'description'");
        this.consume(TokenType.COLON, "Expected ':' after 'description'");
        const desc = this.consume(TokenType.STRING, "Expected string after 'description:'");
        this.consumeNewline();
        this.consume(TokenType.DEDENT, "Expected dedent after emit body");

        return new AST.BackendEmit(event.value, desc.value, this.loc(token));
    }

    // ==================== Utilities ====================

    /**
     * Check if current token matches type
     */
    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    /**
     * Advance and return previous token
     */
    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    /**
     * Check if at end of tokens
     */
    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }

    /**
     * Get current token without consuming
     */
    peek() {
        return this.tokens[this.current];
    }

    /**
     * Get previous token
     */
    previous() {
        return this.tokens[this.current - 1];
    }

    /**
     * Consume token of expected type or error
     */
    consume(type, message) {
        if (this.check(type)) return this.advance();
        this.error(message);
    }

    /**
     * Consume newline (optional, allows multiple)
     */
    consumeNewline() {
        while (this.check(TokenType.NEWLINE)) {
            this.advance();
        }
    }

    /**
     * Get location from token
     */
    loc(token) {
        return {
            line: token.line,
            column: token.column,
            file: token.file
        };
    }

    /**
     * Throw parser error
     */
    error(message) {
        const token = this.peek();
        throw new Error(
            `Parse error at ${token.file}:${token.line}:${token.column}: ${message}\n` +
            `Got token: ${token.type} "${token.value}"`
        );
    }
}

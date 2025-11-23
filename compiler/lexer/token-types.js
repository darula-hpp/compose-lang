/**
 * Token types for the Compose language lexer
 */

export const TokenType = {
    // Special tokens
    EOF: 'EOF',
    NEWLINE: 'NEWLINE',
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',

    // Identifiers and literals
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',

    // Keywords - General
    IMPORT: 'IMPORT',
    DEFINE: 'DEFINE',
    STRUCTURE: 'STRUCTURE',
    FUNCTION: 'FUNCTION',
    HAS: 'HAS',
    AS: 'AS',
    IS: 'IS',
    LIST: 'LIST',
    OF: 'OF',

    // Keywords - Function/Component attributes
    INPUTS: 'INPUTS',
    RETURNS: 'RETURNS',
    DESCRIPTION: 'DESCRIPTION',
    ACCEPTS: 'ACCEPTS',
    WITH: 'WITH',
    PROTECTED: 'PROTECTED',

    // Frontend keywords
    FRONTEND_PAGE: 'FRONTEND_PAGE',
    FRONTEND_COMPONENT: 'FRONTEND_COMPONENT',
    FRONTEND_STATE: 'FRONTEND_STATE',
    FRONTEND_RENDER: 'FRONTEND_RENDER',
    FRONTEND_THEME: 'FRONTEND_THEME',

    // Backend keywords
    BACKEND_READ_ENV: 'BACKEND_READ_ENV',
    BACKEND_READ_FILE: 'BACKEND_READ_FILE',
    BACKEND_SAVE_FILE: 'BACKEND_SAVE_FILE',
    BACKEND_CREATE_API: 'BACKEND_CREATE_API',
    BACKEND_QUERY: 'BACKEND_QUERY',
    BACKEND_CONNECT: 'BACKEND_CONNECT',
    BACKEND_EMIT: 'BACKEND_EMIT',

    // Primitive types
    TYPE_NUMBER: 'TYPE_NUMBER',
    TYPE_TEXT: 'TYPE_TEXT',
    TYPE_BOOLEAN: 'TYPE_BOOLEAN',
    TYPE_DATE: 'TYPE_DATE',
    TYPE_DATETIME: 'TYPE_DATETIME',
    TYPE_VOID: 'TYPE_VOID',

    // Operators and punctuation
    COLON: 'COLON',
    COMMA: 'COMMA',

    // Comments
    COMMENT: 'COMMENT',
    CONTEXT_COMMENT: 'CONTEXT_COMMENT',
};

/**
 * Keywords mapping - maps keyword strings to token types
 */
export const KEYWORDS = {
    // General keywords
    'import': TokenType.IMPORT,
    'define': TokenType.DEFINE,
    'structure': TokenType.STRUCTURE,
    'function': TokenType.FUNCTION,
    'has': TokenType.HAS,
    'as': TokenType.AS,
    'is': TokenType.IS,
    'list': TokenType.LIST,
    'of': TokenType.OF,

    // Attribute keywords
    'inputs': TokenType.INPUTS,
    'returns': TokenType.RETURNS,
    'description': TokenType.DESCRIPTION,
    'accepts': TokenType.ACCEPTS,
    'with': TokenType.WITH,
    'protected': TokenType.PROTECTED,

    // Frontend keywords (with dot notation)
    'frontend.page': TokenType.FRONTEND_PAGE,
    'frontend.component': TokenType.FRONTEND_COMPONENT,
    'frontend.state': TokenType.FRONTEND_STATE,
    'frontend.render': TokenType.FRONTEND_RENDER,
    'frontend.theme': TokenType.FRONTEND_THEME,

    // Backend keywords (with dot notation)
    'backend.read_env': TokenType.BACKEND_READ_ENV,
    'backend.read_file': TokenType.BACKEND_READ_FILE,
    'backend.save_file': TokenType.BACKEND_SAVE_FILE,
    'backend.create_api': TokenType.BACKEND_CREATE_API,
    'backend.query': TokenType.BACKEND_QUERY,
    'backend.connect': TokenType.BACKEND_CONNECT,
    'backend.emit': TokenType.BACKEND_EMIT,

    // Primitive types
    'number': TokenType.TYPE_NUMBER,
    'text': TokenType.TYPE_TEXT,
    'boolean': TokenType.TYPE_BOOLEAN,
    'date': TokenType.TYPE_DATE,
    'datetime': TokenType.TYPE_DATETIME,
    'void': TokenType.TYPE_VOID,
};

/**
 * Token class - represents a single token
 */
export class Token {
    /**
     * @param {string} type - Token type from TokenType enum
     * @param {string} value - Token value/lexeme
     * @param {number} line - Line number (1-indexed)
     * @param {number} column - Column number (1-indexed)
     * @param {string} file - Source file path
     */
    constructor(type, value, line, column, file = null) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.file = file;
    }

    /**
     * String representation for debugging
     */
    toString() {
        return `Token(${this.type}, "${this.value}", ${this.line}:${this.column})`;
    }

    /**
     * Check if token is of given type
     */
    is(type) {
        return this.type === type;
    }

    /**
     * Check if token is one of given types
     */
    isOneOf(...types) {
        return types.includes(this.type);
    }
}

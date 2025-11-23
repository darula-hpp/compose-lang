/**
 * Token Types for Compose Language (v0.2.0)
 * Three-keyword architecture specification language
 */

export const TokenType = {
    // Keywords
    MODEL: 'MODEL',
    FEATURE: 'FEATURE',
    GUIDE: 'GUIDE',

    // Type keywords
    TEXT: 'TEXT',
    NUMBER: 'NUMBER',
    BOOL: 'BOOL',
    DATE: 'DATE',
    TIMESTAMP: 'TIMESTAMP',
    IMAGE: 'IMAGE',
    FILE: 'FILE',
    JSON_TYPE: 'JSON_TYPE',
    MARKDOWN: 'MARKDOWN',
    LIST: 'LIST',
    OF: 'OF',

    // Symbols
    COLON: 'COLON',
    DASH: 'DASH',
    PIPE: 'PIPE',
    QUESTION: 'QUESTION',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',

    // Literals
    STRING: 'STRING',
    IDENTIFIER: 'IDENTIFIER',

    // Special
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',
    NEWLINE: 'NEWLINE',
    EOF: 'EOF',
    COMMENT: 'COMMENT',
};

export const KEYWORDS = {
    'model': TokenType.MODEL,
    'feature': TokenType.FEATURE,
    'guide': TokenType.GUIDE,
    'text': TokenType.TEXT,
    'number': TokenType.NUMBER,
    'bool': TokenType.BOOL,
    'date': TokenType.DATE,
    'timestamp': TokenType.TIMESTAMP,
    'image': TokenType.IMAGE,
    'file': TokenType.FILE,
    'json': TokenType.JSON_TYPE,
    'markdown': TokenType.MARKDOWN,
    'list': TokenType.LIST,
    'of': TokenType.OF,
};

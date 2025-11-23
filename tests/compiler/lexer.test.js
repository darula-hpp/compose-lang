/**
 * Test suite for the Compose lexer
 */

import { Lexer, TokenType } from '../../compiler/lexer/index.js';

// Helper to run a test
function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

// Helper to assert equality
function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
}

// ==================== Tests ====================

test('Lexer: Simple import', () => {
    const source = 'import "shared/types.compose"';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.IMPORT);
    assertEqual(tokens[1].type, TokenType.STRING);
    assertEqual(tokens[1].value, 'shared/types.compose');
});

test('Lexer: Structure definition', () => {
    const source = `define structure Customer
  has id as number
  has name as text`;

    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.DEFINE);
    assertEqual(tokens[1].type, TokenType.STRUCTURE);
    assertEqual(tokens[2].type, TokenType.IDENTIFIER);
    assertEqual(tokens[2].value, 'Customer');
    assertEqual(tokens[3].type, TokenType.NEWLINE);
    assertEqual(tokens[4].type, TokenType.INDENT);
    assertEqual(tokens[5].type, TokenType.HAS);
});

test('Lexer: Context comment', () => {
    const source = '## This is a context comment ##';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.CONTEXT_COMMENT);
    assertEqual(tokens[0].value, 'This is a context comment');
});

test('Lexer: Normal comment is ignored', () => {
    const source = '// This is a normal comment\nimport "test"';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Should skip the comment
    assertEqual(tokens[0].type, TokenType.NEWLINE);
    assertEqual(tokens[1].type, TokenType.IMPORT);
});

test('Lexer: Frontend page', () => {
    const source = 'frontend.page "Dashboard"';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.FRONTEND_PAGE);
    assertEqual(tokens[1].type, TokenType.STRING);
    assertEqual(tokens[1].value, 'Dashboard');
});

test('Lexer: Backend API', () => {
    const source = 'backend.create_api "GetCustomer"';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.BACKEND_CREATE_API);
    assertEqual(tokens[1].type, TokenType.STRING);
    assertEqual(tokens[1].value, 'GetCustomer');
});

test('Lexer: List type', () => {
    const source = 'define customers as list of Customer';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.DEFINE);
    assertEqual(tokens[1].type, TokenType.IDENTIFIER);
    assertEqual(tokens[2].type, TokenType.AS);
    assertEqual(tokens[3].type, TokenType.LIST);
    assertEqual(tokens[4].type, TokenType.OF);
    assertEqual(tokens[5].type, TokenType.IDENTIFIER);
});

test('Lexer: String literal', () => {
    const source = '"Hello, World!"';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.STRING);
    assertEqual(tokens[0].value, 'Hello, World!');
});

test('Lexer: Number literal (integer)', () => {
    const source = '42';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.NUMBER);
    assertEqual(tokens[0].value, '42');
});

test('Lexer: Number literal (decimal)', () => {
    const source = '3.14';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    assertEqual(tokens[0].type, TokenType.NUMBER);
    assertEqual(tokens[0].value, '3.14');
});

test('Lexer: Multiple dedents', () => {
    const source = `define structure User
  has id as number
  has profile as Profile
    has name as text
define total as number`;

    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Find the dedents before "define total"
    let dedentCount = 0;
    for (const token of tokens) {
        if (token.type === TokenType.DEDENT) {
            dedentCount++;
        }
    }

    // Should have 2 dedents (from nested structure back to top level)
    assertEqual(dedentCount >= 2, true, 'Should have at least 2 dedents');
});

console.log('\n=== Lexer Tests Complete ===');

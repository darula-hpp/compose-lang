/**
 * Lexer for the Compose language
 * Tokenizes .compose source code into a stream of tokens
 */

import { Token, TokenType, KEYWORDS } from './token-types.js';
import { IndentationTracker } from './indentation-tracker.js';

export class Lexer {
    /**
     * @param {string} source - Source code to tokenize
     * @param {string} file - Source file path
     */
    constructor(source, file = '<input>') {
        this.source = source;
        this.file = file;
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.lineStart = 0; // Position of current line start
        this.tokens = [];
        this.indentTracker = new IndentationTracker();
        this.atLineStart = true; // Track if we're at the start of a line
    }

    /**
     * Tokenize the entire source code
     * @returns {Token[]} - Array of tokens
     */
    tokenize() {
        this.tokens = [];

        while (!this.isAtEnd()) {
            this.scanToken();
        }

        // Add final dedents and EOF
        const finalDedents = this.indentTracker.finalize(this.line, this.column, this.file);
        this.tokens.push(...finalDedents);
        this.tokens.push(new Token(TokenType.EOF, '', this.line, this.column, this.file));

        return this.tokens;
    }

    /**
     * Scan and add a single token
     */
    scanToken() {
        // Handle indentation at start of line
        if (this.atLineStart) {
            this.handleIndentation();
            this.atLineStart = false;

            // Skip if line is now empty or comment
            if (this.isAtEnd() || this.peek() === '\n') {
                return;
            }
        }

        const char = this.advance();

        switch (char) {
            case '\n':
                this.addToken(TokenType.NEWLINE, '\n');
                this.line++;
                this.column = 1;
                this.lineStart = this.pos;
                this.atLineStart = true;
                break;

            case '\r':
                // Handle \r\n
                if (this.peek() === '\n') {
                    this.advance();
                }
                this.addToken(TokenType.NEWLINE, '\n');
                this.line++;
                this.column = 1;
                this.lineStart = this.pos;
                this.atLineStart = true;
                break;

            case ' ':
            case '\t':
                // Skip whitespace (indentation is handled separately)
                break;

            case ':':
                this.addToken(TokenType.COLON, ':');
                break;

            case ',':
                this.addToken(TokenType.COMMA, ',');
                break;

            case '"':
                this.scanString();
                break;

            case '/':
                if (this.peek() === '/') {
                    this.scanComment();
                } else {
                    this.error(`Unexpected character: ${char}`);
                }
                break;

            case '#':
                if (this.peek() === '#') {
                    this.scanContextComment();
                } else {
                    this.error(`Unexpected character: ${char}`);
                }
                break;

            default:
                if (this.isDigit(char)) {
                    this.scanNumber();
                } else if (this.isAlpha(char)) {
                    this.scanIdentifierOrKeyword();
                } else {
                    this.error(`Unexpected character: ${char}`);
                }
                break;
        }
    }

    /**
     * Handle indentation at the start of a line
     */
    handleIndentation() {
        let spaces = 0;

        // Count leading spaces
        while (!this.isAtEnd() && this.peek() === ' ') {
            spaces++;
            this.advance();
        }

        // Skip empty lines and comment-only lines
        if (this.isAtEnd() || this.peek() === '\n' ||
            (this.peek() === '/' && this.peekNext() === '/') ||
            (this.peek() === '#' && this.peekNext() === '#')) {
            return;
        }

        // Process indentation change
        const indentTokens = this.indentTracker.process(spaces, this.line, this.column, this.file);
        this.tokens.push(...indentTokens);
    }

    /**
     * Scan a string literal
     */
    scanString() {
        const startLine = this.line;
        const startColumn = this.column - 1;
        let value = '';

        while (!this.isAtEnd() && this.peek() !== '"') {
            if (this.peek() === '\n') {
                this.error('Unterminated string literal');
            }
            value += this.advance();
        }

        if (this.isAtEnd()) {
            this.error('Unterminated string literal');
        }

        // Consume closing "
        this.advance();

        this.addToken(TokenType.STRING, value, startLine, startColumn);
    }

    /**
     * Scan a number literal
     */
    scanNumber() {
        const startColumn = this.column - 1;
        let value = this.source[this.pos - 1];

        while (!this.isAtEnd() && this.isDigit(this.peek())) {
            value += this.advance();
        }

        // Handle decimal point
        if (!this.isAtEnd() && this.peek() === '.' && this.isDigit(this.peekNext())) {
            value += this.advance(); // consume '.'

            while (!this.isAtEnd() && this.isDigit(this.peek())) {
                value += this.advance();
            }
        }

        this.addToken(TokenType.NUMBER, value, this.line, startColumn);
    }

    /**
     * Scan an identifier or keyword
     */
    scanIdentifierOrKeyword() {
        const startColumn = this.column - 1;
        let value = this.source[this.pos - 1];

        while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === '.')) {
            value += this.advance();
        }

        // Check if it's a keyword
        const type = KEYWORDS[value] || TokenType.IDENTIFIER;
        this.addToken(type, value, this.line, startColumn);
    }

    /**
     * Scan a normal comment (// ...)
     */
    scanComment() {
        this.advance(); // consume second '/'
        let value = '';

        while (!this.isAtEnd() && this.peek() !== '\n') {
            value += this.advance();
        }

        // Normal comments are ignored (not added to tokens)
        // They are completely stripped from the output
    }

    /**
     * Scan a context comment (## ... ##)
     */
    scanContextComment() {
        const startColumn = this.column - 1;
        this.advance(); // consume second '#'
        let value = '';

        // Skip leading whitespace
        while (!this.isAtEnd() && this.peek() === ' ') {
            this.advance();
        }

        // Read until we find closing ##
        while (!this.isAtEnd()) {
            if (this.peek() === '#' && this.peekNext() === '#') {
                break;
            }
            if (this.peek() === '\n') {
                this.error('Unterminated context comment');
            }
            value += this.advance();
        }

        if (this.isAtEnd()) {
            this.error('Unterminated context comment');
        }

        // Consume closing ##
        this.advance();
        this.advance();

        // Trim trailing whitespace
        value = value.trim();

        this.addToken(TokenType.CONTEXT_COMMENT, value, this.line, startColumn);
    }

    /**
     * Add a token to the token list
     */
    addToken(type, value, line = this.line, column = this.column - value.length) {
        this.tokens.push(new Token(type, value, line, column, this.file));
    }

    /**
     * Advance to next character and return current
     */
    advance() {
        const char = this.source[this.pos];
        this.pos++;
        this.column++;
        return char;
    }

    /**
     * Peek at current character without consuming
     */
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source[this.pos];
    }

    /**
     * Peek at next character without consuming
     */
    peekNext() {
        if (this.pos + 1 >= this.source.length) return '\0';
        return this.source[this.pos + 1];
    }

    /**
     * Check if at end of source
     */
    isAtEnd() {
        return this.pos >= this.source.length;
    }

    /**
     * Check if character is a digit
     */
    isDigit(char) {
        return char >= '0' && char <= '9';
    }

    /**
     * Check if character is alphabetic
     */
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
    }

    /**
     * Check if character is alphanumeric
     */
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }

    /**
     * Throw a lexer error
     */
    error(message) {
        throw new Error(
            `Lexer error at ${this.file}:${this.line}:${this.column}: ${message}`
        );
    }
}

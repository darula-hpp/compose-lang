/**
 * Indentation tracker for managing indent/dedent tokens
 * Compose uses significant indentation (2 spaces per level)
 */

import { Token, TokenType } from './token-types.js';

export class IndentationTracker {
    constructor() {
        this.stack = [0]; // Stack of indentation levels, starts with 0
        this.pendingDedents = 0; // Number of pending DEDENT tokens
    }

    /**
     * Process a line's indentation and generate appropriate tokens
     * @param {number} spaces - Number of spaces at start of line
     * @param {number} line - Current line number
     * @param {number} column - Current column number
     * @param {string} file - Source file path
     * @returns {Token[]} - Array of INDENT or DEDENT tokens
     */
    process(spaces, line, column, file) {
        const tokens = [];
        const currentLevel = this.stack[this.stack.length - 1];

        // Indentation must be in multiples of 2
        if (spaces % 2 !== 0) {
            throw new Error(
                `Invalid indentation at ${file}:${line}:${column}. ` +
                `Expected multiple of 2 spaces, got ${spaces}`
            );
        }

        if (spaces > currentLevel) {
            // Indent - can only increase by one level (2 spaces) at a time
            if (spaces - currentLevel !== 2) {
                throw new Error(
                    `Invalid indentation at ${file}:${line}:${column}. ` +
                    `Expected ${currentLevel + 2} spaces, got ${spaces}`
                );
            }
            this.stack.push(spaces);
            tokens.push(new Token(TokenType.INDENT, '', line, column, file));
        } else if (spaces < currentLevel) {
            // Dedent - may dedent multiple levels
            while (this.stack.length > 1 && this.stack[this.stack.length - 1] > spaces) {
                this.stack.pop();
                tokens.push(new Token(TokenType.DEDENT, '', line, column, file));
            }

            // Verify we landed on a valid indentation level
            if (this.stack[this.stack.length - 1] !== spaces) {
                throw new Error(
                    `Invalid dedentation at ${file}:${line}:${column}. ` +
                    `Indentation ${spaces} does not match any outer level`
                );
            }
        }
        // If spaces === currentLevel, no indent/dedent needed

        return tokens;
    }

    /**
     * Get all remaining dedent tokens at end of file
     * @param {number} line - Current line number
     * @param {number} column - Current column number
     * @param {string} file - Source file path
     * @returns {Token[]} - Array of DEDENT tokens
     */
    finalize(line, column, file) {
        const tokens = [];

        // Pop all remaining levels except the base (0)
        while (this.stack.length > 1) {
            this.stack.pop();
            tokens.push(new Token(TokenType.DEDENT, '', line, column, file));
        }

        return tokens;
    }

    /**
     * Get current indentation level
     */
    getCurrentLevel() {
        return this.stack[this.stack.length - 1];
    }

    /**
     * Reset tracker to initial state
     */
    reset() {
        this.stack = [0];
        this.pendingDedents = 0;
    }
}

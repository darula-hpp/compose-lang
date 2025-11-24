/**
 * Simplified Parser for Compose Language (v0.2.0)
 * Supports three keywords: model, feature, and guide
 */

import { TokenType } from '../lexer/token-types.js';
import {
    Program,
    ModelDeclaration,
    FieldDeclaration,
    TypeAnnotation,
    FeatureDeclaration,
    GuideDeclaration,
    ImportDeclaration
} from './ast-nodes.js';

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const models = [];
        const features = [];
        const guides = [];
        const imports = [];

        while (!this.isAtEnd()) {
            // Skip comments and newlines
            while (this.match(TokenType.COMMENT, TokenType.NEWLINE)) {
                // match() already advanced, no need to advance again
            }

            if (this.isAtEnd()) break;

            // Parse import
            if (this.check('import')) {
                imports.push(this.parseImport());
            }
            // Parse model
            else if (this.match(TokenType.MODEL)) {
                models.push(this.parseModel());
            }
            // Parse feature
            else if (this.match(TokenType.FEATURE)) {
                features.push(this.parseFeature());
            }
            // Parse guide
            else if (this.match(TokenType.GUIDE)) {
                guides.push(this.parseGuide());
            }
            // Skip unknown lines (comments, etc.)
            else {
                this.advance();
            }
        }

        return new Program(models, features, guides, imports);
    }

    /**
     * Parse: import "path/to/file.compose"
     */
    parseImport() {
        this.consume('import');
        const path = this.consume(TokenType.STRING).value;
        this.skipNewlines();
        return new ImportDeclaration(path);
    }

    /**
     * Parse model declaration
     * model User:
     *   email: text (unique)
     *   name: text
     */
    parseModel() {
        const name = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.COLON);
        this.skipNewlines();
        this.consume(TokenType.INDENT);

        const fields = [];
        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
                continue;
            }
            fields.push(this.parseField());
        }

        if (!this.isAtEnd()) {
            this.consume(TokenType.DEDENT);
        }

        return new ModelDeclaration(name, fields);
    }

    /**
     * Parse field declaration
     * email: text (unique)
     * role: "admin" | "member"
     * assignee: User?
     */
    parseField() {
        const name = this.consumeIdentifier();
        this.consume(TokenType.COLON);

        const fieldType = this.parseType();

        // Check for optional marker
        const optional = this.match(TokenType.QUESTION);

        // Parse constraints like (unique), (required)
        const constraints = [];
        if (this.match(TokenType.LPAREN)) {
            while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
                if (this.check(TokenType.IDENTIFIER)) {
                    constraints.push(this.advance().value);
                } else {
                    this.advance();
                }
            }
            this.consume(TokenType.RPAREN);
        }

        this.skipNewlines();
        return new FieldDeclaration(name, fieldType, optional, constraints);
    }

    /**
     * Parse type annotation
     * text, number, User, list of Todo, "admin" | "member"
     */
    parseType() {
        // Handle enum types: "value1" | "value2"
        if (this.check(TokenType.STRING)) {
            const enumValues = [this.advance().value];
            while (this.match(TokenType.PIPE)) {
                enumValues.push(this.consume(TokenType.STRING).value);
            }
            return new TypeAnnotation('enum', false, enumValues);
        }

        // Handle list types: list of Todo or Todo[]
        if (this.match(TokenType.LIST)) {
            this.consume(TokenType.OF);
            const baseType = this.consumeIdentifier();
            return new TypeAnnotation(baseType, true);
        }

        // Handle array syntax: Todo[]
        const baseType = this.consumeType();
        if (this.match(TokenType.LBRACKET)) {
            this.consume(TokenType.RBRACKET);
            return new TypeAnnotation(baseType, true);
        }

        return new TypeAnnotation(baseType, false);
    }

    /**
     * Consume a type token (text, number, bool, date, or custom type)
     */
    consumeType() {
        const token = this.peek();

        // Built-in types
        if (this.match(TokenType.TEXT)) return 'text';
        if (this.match(TokenType.NUMBER)) return 'number';
        if (this.match(TokenType.BOOL)) return 'bool';
        if (this.match(TokenType.DATE)) return 'date';
        if (this.match(TokenType.TIMESTAMP)) return 'timestamp';
        if (this.match(TokenType.IMAGE)) return 'image';
        if (this.match(TokenType.FILE)) return 'file';
        if (this.match(TokenType.JSON_TYPE)) return 'json';
        if (this.match(TokenType.MARKDOWN)) return 'markdown';

        // Custom type (reference to a model)
        if (this.check(TokenType.IDENTIFIER)) {
            return this.advance().value;
        }

        throw new Error(`Expected type, got ${token.type}`);
    }

    /**
     * Parse feature declaration
     * feature "Authentication":
     *   - Email/password signup
     *   - Password reset
     */
    parseFeature() {
        const name = this.consume(TokenType.STRING).value;
        this.consume(TokenType.COLON);
        this.skipNewlines();

        const items = [];

        // Check if there's an indent (multi-line feature)
        if (this.match(TokenType.INDENT)) {
            while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
                if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
                    continue;
                }

                // Feature items start with dash
                if (this.match(TokenType.DASH)) {
                    const item = this.consumeRestOfLine();
                    if (item) items.push(item);
                } else {
                    this.advance();
                }
            }

            if (!this.isAtEnd()) {
                this.consume(TokenType.DEDENT);
            }
        }

        return new FeatureDeclaration(name, items);
    }

    /**
     * Consume the rest of the current line as a string
     */
    consumeRestOfLine() {
        const parts = [];
        while (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
            const token = this.advance();
            if (token.type === TokenType.STRING) {
                parts.push(`"${token.value}"`);
            } else if (token.value) {
                parts.push(token.value);
            }
        }
        this.skipNewlines();
        return parts.join(' ').trim();
    }

    /**
     * Parse guide declaration (implementation hints)
     * guide "Password Security":
     *   - Minimum 8 characters required
     *   - Use bcrypt with cost 12
     */
    parseGuide() {
        const name = this.consume(TokenType.STRING).value;
        this.consume(TokenType.COLON);
        this.skipNewlines();

        const items = [];

        // Check if there's an indent (multi-line guide)
        if (this.match(TokenType.INDENT)) {
            while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
                if (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
                    continue;
                }

                // Guide items start with dash
                if (this.match(TokenType.DASH)) {
                    const item = this.consumeRestOfLine();
                    if (item) items.push(item);
                } else {
                    this.advance();
                }
            }

            if (!this.isAtEnd()) {
                this.consume(TokenType.DEDENT);
            }
        }

        return new GuideDeclaration(name, items);
    }

    /**
     * Helper methods
     */
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        const token = this.peek();
        return token.type === type || token.value === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
    }

    peek() {
        return this.tokens[this.current] || { type: TokenType.EOF };
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    consumeIdentifier() {
        if (this.check(TokenType.IDENTIFIER)) {
            return this.advance().value;
        }

        // Allow keywords as identifiers
        const token = this.peek();
        // Check if it's a keyword (not a symbol/literal/special)
        const nonIdentifierTypes = [
            TokenType.COLON, TokenType.DASH, TokenType.PIPE, TokenType.QUESTION,
            TokenType.LPAREN, TokenType.RPAREN, TokenType.LBRACKET, TokenType.RBRACKET,
            TokenType.COMMA, TokenType.STRING, TokenType.NEWLINE, TokenType.INDENT,
            TokenType.DEDENT, TokenType.EOF, TokenType.COMMENT
        ];

        if (!nonIdentifierTypes.includes(token.type)) {
            return this.advance().value;
        }

        throw new Error(`Expected identifier, got ${token.type} ('${token.value}')`);
    }

    consume(type, message) {
        if (this.check(type)) {
            return this.advance();
        }
        throw new Error(message || `Expected '${type}', got ${this.peek().value}`);
    }

    skipNewlines() {
        while (this.match(TokenType.NEWLINE)) {
            // skip
        }
    }

}

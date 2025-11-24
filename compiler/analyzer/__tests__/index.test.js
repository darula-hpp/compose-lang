/**
 * Analyzer Tests
 * Comprehensive tests for semantic analysis
 */

import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { SemanticAnalyzer } from '../index.js';
import { Program, ModelDeclaration, FieldDeclaration, TypeAnnotation } from '../../parser/ast-nodes.js';

describe('SemanticAnalyzer', () => {
    let analyzer;

    beforeEach(() => {
        analyzer = new SemanticAnalyzer({ loadImports: false });
    });

    describe('Model Registration', () => {
        it('should register a simple model', () => {
            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('name', new TypeAnnotation('text')),
                    new FieldDeclaration('age', new TypeAnnotation('number'))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
            assert.equal(result.errors.length, 0);
            assert.ok(analyzer.symbolTable.types.has('User'));
        });

        it('should register multiple models', () => {
            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('name', new TypeAnnotation('text'))
                ]),
                new ModelDeclaration('Product', [
                    new FieldDeclaration('title', new TypeAnnotation('text')),
                    new FieldDeclaration('price', new TypeAnnotation('number'))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
            assert.ok(analyzer.symbolTable.types.has('User'));
            assert.ok(analyzer.symbolTable.types.has('Product'));
        });

        it('should detect duplicate model names', () => {
            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('name', new TypeAnnotation('text'))
                ]),
                new ModelDeclaration('User', [
                    new FieldDeclaration('email', new TypeAnnotation('text'))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, false);
            assert.ok(result.errors.length > 0);
            assert.ok(result.errors.some(e => e.message.includes('Duplicate')));
        });
    });

    describe('Type Validation', () => {
        it('should validate primitive types', () => {
            const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];

            for (const type of primitives) {
                // Create fresh analyzer for each iteration to avoid duplicate model errors
                const freshAnalyzer = new SemanticAnalyzer({ loadImports: false });
                const ast = new Program([
                    new ModelDeclaration('Test', [
                        new FieldDeclaration('field', new TypeAnnotation(type))
                    ])
                ], [], []);

                const result = freshAnalyzer.analyze(ast);
                assert.equal(result.success, true, `Primitive type ${type} should be valid`);
            }
        });

        it('should validate model references', () => {
            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('name', new TypeAnnotation('text'))
                ]),
                new ModelDeclaration('Order', [
                    new FieldDeclaration('userId', new TypeAnnotation('User'))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
            assert.equal(result.errors.length, 0);
        });

        it('should detect undefined type references', () => {
            const ast = new Program([
                new ModelDeclaration('Order', [
                    new FieldDeclaration('userId', new TypeAnnotation('Customer')) // Customer not defined
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, false);
            assert.ok(result.errors.some(e => e.message.includes('undefined type')));
        });

        it('should validate list types', () => {
            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('tags', new TypeAnnotation('text', true)) // list of text
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
        });

        it('should validate list of model types', () => {
            const ast = new Program([
                new ModelDeclaration('Product', [
                    new FieldDeclaration('name', new TypeAnnotation('text'))
                ]),
                new ModelDeclaration('Order', [
                    new FieldDeclaration('items', new TypeAnnotation('Product', true)) // list of Product
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
        });

        it('should detect undefined types in lists', () => {
            const ast = new Program([
                new ModelDeclaration('Order', [
                    new FieldDeclaration('items', new TypeAnnotation('NonExistent', true))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, false);
            assert.ok(result.errors.some(e => e.message.includes('undefined type')));
        });
    });

    describe('Optional Fields', () => {
        it('should allow optional fields', () => {
            const optionalField = new FieldDeclaration('bio', new TypeAnnotation('text'));
            optionalField.optional = true;

            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('name', new TypeAnnotation('text')),
                    optionalField
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
        });
    });

    describe('Enum Types', () => {
        it('should allow enum field types', () => {
            const enumType = new TypeAnnotation('text', false, ['admin', 'member', 'guest']);

            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('role', enumType)
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle deeply nested model references', () => {
            const ast = new Program([
                new ModelDeclaration('Address', [
                    new FieldDeclaration('street', new TypeAnnotation('text'))
                ]),
                new ModelDeclaration('User', [
                    new FieldDeclaration('address', new TypeAnnotation('Address'))
                ]),
                new ModelDeclaration('Order', [
                    new FieldDeclaration('user', new TypeAnnotation('User'))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
        });

        it('should handle circular references (valid)', () => {
            const ast = new Program([
                new ModelDeclaration('User', [
                    new FieldDeclaration('bestFriend', new TypeAnnotation('User', false))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            // Circular references are OK at the type level
            assert.equal(result.success, true);
        });

        it('should validate complex nested structures', () => {
            const ast = new Program([
                new ModelDeclaration('Tag', [
                    new FieldDeclaration('name', new TypeAnnotation('text'))
                ]),
                new ModelDeclaration('Product', [
                    new FieldDeclaration('tags', new TypeAnnotation('Tag', true)) // list of Tag
                ]),
                new ModelDeclaration('Order', [
                    new FieldDeclaration('items', new TypeAnnotation('Product', true)) // list of Product
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, true);
        });
    });

    describe('Error Messages', () => {
        it('should provide helpful error for undefined types', () => {
            const ast = new Program([
                new ModelDeclaration('Order', [
                    new FieldDeclaration('customer', new TypeAnnotation('Customer'))
                ])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, false);
            const error = result.errors[0];
            assert.ok(error.message.includes('Customer'));
            assert.ok(error.message.includes('undefined'));
        });

        it('should provide helpful error for duplicates', () => {
            const ast = new Program([
                new ModelDeclaration('User', []),
                new ModelDeclaration('User', [])
            ], [], []);

            const result = analyzer.analyze(ast);

            assert.equal(result.success, false);
            const error = result.errors[0];
            assert.ok(error.message.includes('Duplicate') || error.message.includes('already defined'));
            assert.ok(error.message.includes('User'));
        });
    });
});

/**
 * Type Checker Tests
 * Tests for type validation logic
 */

import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { TypeChecker } from '../type-checker.js';
import { createGlobalSymbolTable } from '../symbol-table.js';
import { ModelDeclaration, FieldDeclaration, TypeAnnotation } from '../../parser/ast-nodes.js';

describe('TypeChecker', () => {
    let symbolTable;
    let typeChecker;

    beforeEach(() => {
        symbolTable = createGlobalSymbolTable();
        typeChecker = new TypeChecker(symbolTable);
    });

    describe('Primitive Type Validation', () => {
        const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];

        primitives.forEach(type => {
            it(`should recognize ${type} as primitive`, () => {
                const field = new FieldDeclaration('test', new TypeAnnotation(type));
                const model = new ModelDeclaration('Test', [field]);

                typeChecker.validateModel(model);

                assert.equal(typeChecker.hasErrors(), false);
            });
        });

        it('should reject unknown primitive type', () => {
            const field = new FieldDeclaration('test', new TypeAnnotation('string')); // Wrong!
            const model = new ModelDeclaration('Test', [field]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), true);
            assert.ok(typeChecker.getErrors()[0].message.includes('undefined type'));
        });
    });

    describe('Model Reference Validation', () => {
        it('should validate existing model reference', () => {
            // Register User model
            symbolTable.defineType('User', {
                kind: 'model',
                name: 'User',
                fields: []
            });

            const field = new FieldDeclaration('owner', new TypeAnnotation('User'));
            const model = new ModelDeclaration('Product', [field]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), false);
        });

        it('should reject non-existent model reference', () => {
            const field = new FieldDeclaration('owner', new TypeAnnotation('Customer'));
            const model = new ModelDeclaration('Product', [field]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), true);
            const error = typeChecker.getErrors()[0];
            assert.ok(error.message.includes('Customer'));
        });
    });

    describe('List Type Validation', () => {
        it('should validate list of primitive type', () => {
            const field = new FieldDeclaration('tags', new TypeAnnotation('text', true));
            const model = new ModelDeclaration('Product', [field]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), false);
        });

        it('should validate list of model type', () => {
            symbolTable.defineType('Tag', {
                kind: 'model',
                name: 'Tag',
                fields: []
            });

            const field = new FieldDeclaration('tags', new TypeAnnotation('Tag', true));
            const model = new ModelDeclaration('Product', [field]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), false);
        });

        it('should reject list of undefined type', () => {
            const field = new FieldDeclaration('items', new TypeAnnotation('NonExistent', true));
            const model = new ModelDeclaration('Cart', [field]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), true);
        });
    });

    describe('Enum Type Validation', () => {
        it('should allow enum types without validation', () => {
            const enumType = new TypeAnnotation('text', false, ['pending', 'approved', 'rejected']);
            const field = new FieldDeclaration('status', enumType);
            const model = new ModelDeclaration('Order', [field]);

            typeChecker.validateModel(model);

            // Enums skip type lookup validation
            assert.equal(typeChecker.hasErrors(), false);
        });
    });

    describe('Duplicate Field Detection', () => {
        it('should detect duplicate field names', () => {
            const model = new ModelDeclaration('User', [
                new FieldDeclaration('name', new TypeAnnotation('text')),
                new FieldDeclaration('name', new TypeAnnotation('text')) // Duplicate!
            ]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), true);
            assert.ok(typeChecker.getErrors()[0].message.includes('Duplicate field'));
        });

        it('should allow different field names', () => {
            const model = new ModelDeclaration('User', [
                new FieldDeclaration('firstName', new TypeAnnotation('text')),
                new FieldDeclaration('lastName', new TypeAnnotation('text'))
            ]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), false);
        });
    });

    describe('Error Accumulation', () => {
        it('should accumulate multiple errors', () => {
            const model = new ModelDeclaration('Test', [
                new FieldDeclaration('field1', new TypeAnnotation('NonExistent1')),
                new FieldDeclaration('field2', new TypeAnnotation('NonExistent2')),
                new FieldDeclaration('field3', new TypeAnnotation('text')) // Valid
            ]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), true);
            assert.equal(typeChecker.getErrors().length, 2);
        });

        it('should clear errors', () => {
            const model = new ModelDeclaration('Test', [
                new FieldDeclaration('field', new TypeAnnotation('BadType'))
            ]);

            typeChecker.validateModel(model);
            assert.equal(typeChecker.hasErrors(), true);

            typeChecker.clearErrors();
            assert.equal(typeChecker.hasErrors(), false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle models with no fields', () => {
            const model = new ModelDeclaration('Empty', []);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), false);
        });

        it('should handle optional fields', () => {
            const optionalField = new FieldDeclaration('bio', new TypeAnnotation('text'));
            optionalField.optional = true;

            const model = new ModelDeclaration('User', [optionalField]);

            typeChecker.validateModel(model);

            assert.equal(typeChecker.hasErrors(), false);
        });
    });
});

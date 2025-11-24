/**
 * Symbol Table Tests
 * Tests for symbol definition and lookup
 */

import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { SymbolTable, Symbol, createGlobalSymbolTable, isPrimitiveType } from '../symbol-table.js';

describe('SymbolTable', () => {
    let symbolTable;

    beforeEach(() => {
        symbolTable = new SymbolTable();
    });

    describe('Symbol Definition', () => {
        it('should define a new symbol', () => {
            const symbol = new Symbol('User', 'model', 'User', { file: 'test.compose', line: 1, column: 1 });

            symbolTable.define('User', symbol);

            assert.ok(symbolTable.hasOwn('User'));
        });

        it('should reject duplicate symbol definition', () => {
            const symbol1 = new Symbol('User', 'model', 'User', { file: 'test.compose', line: 1, column: 1 });
            const symbol2 = new Symbol('User', 'model', 'User', { file: 'test.compose', line: 5, column: 1 });

            symbolTable.define('User', symbol1);

            assert.throws(() => {
                symbolTable.define('User', symbol2);
            }, /Duplicate definition/);
        });
    });

    describe('Symbol Lookup', () => {
        it('should find symbol in current scope', () => {
            const symbol = new Symbol('Product', 'model', 'Product', { file: 'test.compose', line: 1, column: 1 });
            symbolTable.define('Product', symbol);

            const found = symbolTable.lookup('Product');

            assert.ok(found);
            assert.equal(found.name, 'Product');
        });

        it('should return null for non-existent symbol', () => {
            const found = symbolTable.lookup('NonExistent');

            assert.equal(found, null);
        });

        it('should find symbol in parent scope', () => {
            const parentSymbol = new Symbol('Global', 'model', 'Global', { file: 'test.compose', line: 1, column: 1 });
            symbolTable.define('Global', parentSymbol);

            const childTable = symbolTable.createChild();
            const found = childTable.lookup('Global');

            assert.ok(found);
            assert.equal(found.name, 'Global');
        });
    });

    describe('Type Definition', () => {
        it('should define a new type', () => {
            symbolTable.defineType('User', {
                kind: 'model',
                name: 'User',
                fields: []
            });

            assert.ok(symbolTable.types.has('User'));
        });

        it('should reject duplicate type definition', () => {
            symbolTable.defineType('User', {
                kind: 'model',
                name: 'User',
                fields: [],
                location: { file: 'test.compose', line: 1, column: 1 }
            });

            assert.throws(() => {
                symbolTable.defineType('User', {
                    kind: 'model',
                    name: 'User',
                    fields: [],
                    location: { file: 'test.compose', line: 5, column: 1 }
                });
            }, /Duplicate type definition/);
        });
    });

    describe('Type Lookup', () => {
        it('should find type in current scope', () => {
            symbolTable.defineType('Product', {
                kind: 'model',
                name: 'Product',
                fields: []
            });

            const found = symbolTable.lookupType('Product');

            assert.ok(found);
            assert.equal(found.name, 'Product');
        });

        it('should recognize primitive types', () => {
            const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];

            for (const type of primitives) {
                const found = symbolTable.lookupType(type);
                assert.ok(found, `${type} should be found`);
                assert.equal(found.kind, 'primitive');
            }
        });

        it('should find type in parent scope', () => {
            symbolTable.defineType('Global', {
                kind: 'model',
                name: 'Global',
                fields: []
            });

            const childTable = symbolTable.createChild();
            const found = childTable.lookupType('Global');

            assert.ok(found);
            assert.equal(found.name, 'Global');
        });

        it('should return null for undefined type', () => {
            const found = symbolTable.lookupType('NonExistent');

            assert.equal(found, null);
        });
    });

    describe('Scope Hierarchy', () => {
        it('should create child scope', () => {
            const child = symbolTable.createChild();

            assert.ok(child);
            assert.equal(child.parent, symbolTable);
        });

        it('should shadow parent symbols', () => {
            const parentSymbol = new Symbol('name', 'model', 'text', { file: 'test.compose', line: 1, column: 1 });
            symbolTable.define('name', parentSymbol);

            const childTable = symbolTable.createChild();
            const childSymbol = new Symbol('name', 'model', 'number', { file: 'test.compose', line: 5, column: 1 });
            childTable.define('name', childSymbol);

            // Child lookup should find child symbol
            const found = childTable.lookup('name');
            assert.equal(found.type, 'number');

            // Parent lookup should find parent symbol
            const parentFound = symbolTable.lookup('name');
            assert.equal(parentFound.type, 'text');
        });
    });

    describe('Global Symbol Table', () => {
        it('should create global symbol table with primitives', () => {
            const global = createGlobalSymbolTable();

            const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];

            for (const type of primitives) {
                const found = global.lookupType(type);
                assert.ok(found, `${type} should be registered`);
                assert.equal(found.kind, 'primitive');
            }
        });
    });

    describe('isPrimitiveType Helper', () => {
        it('should recognize all v0.2.0 primitive types', () => {
            const primitives = ['text', 'number', 'bool', 'date', 'timestamp', 'image', 'file', 'markdown', 'json'];

            for (const type of primitives) {
                assert.ok(isPrimitiveType(type), `${type} should be primitive`);
            }
        });

        it('should reject old primitive types', () => {
            const oldTypes = ['boolean', 'datetime', 'void', 'string'];

            for (const type of oldTypes) {
                assert.ok(!isPrimitiveType(type), `${type} should NOT be primitive in v0.2.0`);
            }
        });

        it('should reject custom types', () => {
            assert.ok(!isPrimitiveType('User'));
            assert.ok(!isPrimitiveType('Product'));
            assert.ok(!isPrimitiveType('CustomType'));
        });
    });

    describe('getOwnSymbols and getOwnTypes', () => {
        it('should return only own symbols', () => {
            symbolTable.define('parent', new Symbol('parent', 'model', 'text', { file: 'test.compose', line: 1, column: 1 }));

            const child = symbolTable.createChild();
            child.define('child', new Symbol('child', 'model', 'number', { file: 'test.compose', line: 5, column: 1 }));

            const ownSymbols = child.getOwnSymbols();
            assert.equal(ownSymbols.size, 1);
            assert.ok(ownSymbols.has('child'));
            assert.ok(!ownSymbols.has('parent'));
        });

        it('should return only own types', () => {
            symbolTable.defineType('parent', { kind: 'model', name: 'parent' });

            const child = symbolTable.createChild();
            child.defineType('child', { kind: 'model', name: 'child' });

            const ownTypes = child.getOwnTypes();
            assert.equal(ownTypes.size, 1);
            assert.ok(ownTypes.has('child'));
            assert.ok(!ownTypes.has('parent'));
        });
    });
});

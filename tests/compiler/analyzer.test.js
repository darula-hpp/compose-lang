/**
 * Test suite for the Compose semantic analyzer
 */

import { compile } from '../../compiler/index.js';

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

// Helper to assert truthy
function assert(condition, message = 'Assertion failed') {
    if (!condition) {
        throw new Error(message);
    }
}

// ==================== Tests ====================

test('Analyzer: Valid program passes', () => {
    const source = `define structure Customer
  has id as number
  has name as text

define customer as Customer`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed');
    assertEqual(result.errors.length, 0, 'Should have no errors');
});

test('Analyzer: Undefined type error', () => {
    const source = `define customer as UnknownType`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.length > 0, 'Should have errors');
    assert(result.errors[0].message.includes('Undefined type'), 'Should be undefined type error');
});

test('Analyzer: Duplicate definition error', () => {
    const source = `define total as number
define total as text`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('Duplicate')), 'Should have duplicate error');
});

test('Analyzer: Valid structure with fields', () => {
    const source = `define structure User
  has id as number
  has name as text
  has email as text`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed');
    assert(result.symbolTable.lookupType('User'), 'User type should exist');
});

test('Analyzer: Duplicate field names', () => {
    const source = `define structure User
  has id as number
  has id as text`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('Duplicate field')), 'Should have duplicate field error');
});

test('Analyzer: Valid function definition', () => {
    const source = `define function calculateAge
  inputs: birthdate as date
  returns: number
  description: "Calculate age from birthdate"`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed');
    assert(result.symbolTable.lookup('calculateAge'), 'Function should be in symbol table');
});

test('Analyzer: Function missing description', () => {
    const source = `define function test
  returns: number
  description: ""`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('missing description')), 'Should require description');
});

test('Analyzer: List type validation', () => {
    const source = `define structure Customer
  has id as number

define customers as list of Customer`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed');
});

test('Analyzer: List of undefined type', () => {
    const source = `define customers as list of UnknownType`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('Undefined type')), 'Should error on undefined type');
});

test('Analyzer: Frontend component with valid props', () => {
    const source = `define structure Customer
  has id as number
  has name as text

frontend.component "CustomerCard"
  accepts customer as Customer
  description: "Display customer info"`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed');
});

test('Analyzer: Component with undefined prop type', () => {
    const source = `frontend.component "Card"
  accepts data as UnknownType
  description: "A card"`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('Undefined type')), 'Should error on undefined type');
});

test('Analyzer: Backend API requires description', () => {
    const source = `backend.create_api "GetData"
  description: ""`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('missing description')), 'Should require description');
});

test('Analyzer: Primitive types always valid', () => {
    const source = `define count as number
define name as text
define active as boolean
define created as date
define updated as datetime`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed with all primitive types');
    assertEqual(result.errors.length, 0, 'Should have no errors');
});

test('Analyzer: Nested structure types', () => {
    const source = `define structure Address
  has street as text
  has city as text

define structure Customer
  has id as number
  has address as Address`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, true, 'Should succeed');
    assert(result.symbolTable.lookupType('Address'), 'Address type should exist');
    assert(result.symbolTable.lookupType('Customer'), 'Customer type should exist');
});

test('Analyzer: Function with duplicate parameters', () => {
    const source = `define function test
  inputs: x as number, x as text
  returns: number
  description: "Test function"`;

    const result = compile(source, 'test.compose');

    assertEqual(result.success, false, 'Should fail');
    assert(result.errors.some(e => e.message.includes('Duplicate parameter')), 'Should error on duplicate params');
});

console.log('\n=== Semantic Analyzer Tests Complete ===');

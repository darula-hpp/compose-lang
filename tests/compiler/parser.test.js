/**
 * Test suite for the Compose parser
 */

import { compile as fullCompile } from '../../compiler/index.js';

// Helper to compile without analysis for parser-only tests
function compile(source, file = '<input>') {
    return fullCompile(source, file, { skipAnalysis: true }).ast;
}

// Helper to run a test
function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
        console.error(error.stack);
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

test('Parser: Simple import', () => {
    const source = 'import "shared/types.compose"';
    const ast = compile(source);

    assertEqual(ast.type, 'Program');
    assertEqual(ast.statements.length, 1);
    assertEqual(ast.statements[0].type, 'ImportStatement');
    assertEqual(ast.statements[0].path, 'shared/types.compose');
});

test('Parser: Structure definition', () => {
    const source = `define structure Customer
  has id as number
  has name as text`;

    const ast = compile(source);

    assertEqual(ast.statements.length, 1);
    assertEqual(ast.statements[0].type, 'StructureDefinition');
    assertEqual(ast.statements[0].name, 'Customer');
    assertEqual(ast.statements[0].fields.length, 2);
    assertEqual(ast.statements[0].fields[0].name, 'id');
    assertEqual(ast.statements[0].fields[0].fieldType.name, 'number');
});

test('Parser: Variable definition', () => {
    const source = 'define total as number';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'VariableDefinition');
    assertEqual(ast.statements[0].name, 'total');
    assertEqual(ast.statements[0].varType.name, 'number');
    assertEqual(ast.statements[0].explanation, null);
});

test('Parser: Explained variable', () => {
    const source = 'define startDate as "a date object representing today\'s date"';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'VariableDefinition');
    assertEqual(ast.statements[0].name, 'startDate');
    assertEqual(ast.statements[0].varType, null);
    assertEqual(ast.statements[0].explanation, "a date object representing today's date");
});

test('Parser: List type', () => {
    const source = 'define customers as list of Customer';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'VariableDefinition');
    assertEqual(ast.statements[0].varType.type, 'ListTypeNode');
    assertEqual(ast.statements[0].varType.elementType.name, 'Customer');
});

test('Parser: Function definition', () => {
    const source = `define function calculateAge
  inputs: birthdate as date
  returns: number
  description: "Calculate age from birthdate"`;

    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'FunctionDefinition');
    assertEqual(ast.statements[0].name, 'calculateAge');
    assertEqual(ast.statements[0].parameters.length, 1);
    assertEqual(ast.statements[0].parameters[0].name, 'birthdate');
    assertEqual(ast.statements[0].returnType.name, 'number');
    assertEqual(ast.statements[0].description, 'Calculate age from birthdate');
});

test('Parser: Frontend page', () => {
    const source = `frontend.page "Dashboard"
  is protected
  description: "Main dashboard"`;

    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'FrontendPage');
    assertEqual(ast.statements[0].name, 'Dashboard');
    assertEqual(ast.statements[0].isProtected, true);
    assertEqual(ast.statements[0].description, 'Main dashboard');
});

test('Parser: Frontend component', () => {
    const source = `frontend.component "CustomerCard"
  accepts customer as Customer
  description: "Renders customer details"`;

    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'FrontendComponent');
    assertEqual(ast.statements[0].name, 'CustomerCard');
    assertEqual(ast.statements[0].props.length, 1);
    assertEqual(ast.statements[0].props[0].name, 'customer');
    assertEqual(ast.statements[0].description, 'Renders customer details');
});

test('Parser: Frontend state', () => {
    const source = 'frontend.state selectedTab as "stores the currently active tab"';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'FrontendState');
    assertEqual(ast.statements[0].name, 'selectedTab');
    assertEqual(ast.statements[0].explanation, 'stores the currently active tab');
});

test('Parser: Backend API', () => {
    const source = `backend.create_api "GetCustomer"
  description: "Fetch a customer by ID"`;

    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'BackendAPI');
    assertEqual(ast.statements[0].name, 'GetCustomer');
    assertEqual(ast.statements[0].description, 'Fetch a customer by ID');
});

test('Parser: Backend query', () => {
    const source = `backend.query "FetchInvoices"
  description: "Return all invoices"`;

    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'BackendQuery');
    assertEqual(ast.statements[0].name, 'FetchInvoices');
});

test('Parser: Backend read env', () => {
    const source = 'backend.read_env DATABASE_URL';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'BackendReadEnv');
    assertEqual(ast.statements[0].varName, 'DATABASE_URL');
});

test('Parser: Backend read file', () => {
    const source = 'backend.read_file "config.json"';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'BackendReadFile');
    assertEqual(ast.statements[0].path, 'config.json');
});

test('Parser: Context comment', () => {
    const source = '## This is context for the LLM ##';
    const ast = compile(source);

    assertEqual(ast.statements[0].type, 'ContextComment');
    assertEqual(ast.statements[0].text, 'This is context for the LLM');
});

test('Parser: Complete program', () => {
    const source = `import "shared/types.compose"

## Customer management module ##

define structure Customer
  has id as number
  has name as text

define customers as list of Customer

frontend.page "Customers"
  is protected
  description: "Customer list page"

backend.create_api "GetCustomers"
  description: "Fetch all customers"`;

    const ast = compile(source);

    assertEqual(ast.type, 'Program');
    assertEqual(ast.statements.length, 6);
    assertEqual(ast.statements[0].type, 'ImportStatement');
    assertEqual(ast.statements[1].type, 'ContextComment');
    assertEqual(ast.statements[2].type, 'StructureDefinition');
    assertEqual(ast.statements[3].type, 'VariableDefinition');
    assertEqual(ast.statements[4].type, 'FrontendPage');
    assertEqual(ast.statements[5].type, 'BackendAPI');
});

console.log('\n=== Parser Tests Complete ===');

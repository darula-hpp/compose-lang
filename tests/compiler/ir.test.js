/**
 * Test suite for the Compose IR generator
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

test('IR: Basic structure', () => {
    const source = `define structure Customer
  has id as number
  has name as text`;

    const result = compile(source, 'test.compose');

    assert(result.success, 'Should compile successfully');
    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.version, '1.0', 'Should have version 1.0');
    assertEqual(result.ir.module, 'test.compose', 'Should have correct module path');
    assertEqual(result.ir.structures.length, 1, 'Should have 1 structure');
    assertEqual(result.ir.structures[0].name, 'Customer', 'Should have Customer structure');
    assertEqual(result.ir.structures[0].fields.length, 2, 'Should have 2 fields');
});

test('IR: Variable definition', () => {
    const source = 'define total as number';
    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.variables.length, 1, 'Should have 1 variable');
    assertEqual(result.ir.variables[0].name, 'total', 'Should have total variable');
    assertEqual(result.ir.variables[0].type, 'number', 'Should have number type');
    assertEqual(result.ir.variables[0].explanation, null, 'Should have no explanation');
});

test('IR: Explained variable', () => {
    const source = 'define today as "current date"';
    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.variables[0].type, null, 'Should have null type');
    assertEqual(result.ir.variables[0].explanation, 'current date', 'Should have explanation');
});

test('IR: List type', () => {
    const source = `define structure Item
  has id as number

define items as list of Item`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    const variable = result.ir.variables[0];
    assertEqual(variable.name, 'items', 'Should have items variable');
    assert(typeof variable.type === 'object', 'List type should be object');
    assertEqual(variable.type.kind, 'list', 'Should be list type');
    assertEqual(variable.type.of, 'Item', 'Should be list of Item');
});

test('IR: Function definition', () => {
    const source = `define function calculateAge
  inputs: birthdate as date
  returns: number
  description: "Calculate age from birthdate"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.functions.length, 1, 'Should have 1 function');
    const func = result.ir.functions[0];
    assertEqual(func.name, 'calculateAge', 'Should have correct name');
    assertEqual(func.inputs.length, 1, 'Should have 1 input');
    assertEqual(func.inputs[0].name, 'birthdate', 'Should have birthdate param');
    assertEqual(func.returns, 'number', 'Should return number');
    assertEqual(func.description, 'Calculate age from birthdate', 'Should have description');
});

test('IR: Frontend page', () => {
    const source = `frontend.page "Dashboard"
  is protected
  description: "Main dashboard"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.frontend.pages.length, 1, 'Should have 1 page');
    const page = result.ir.frontend.pages[0];
    assertEqual(page.name, 'Dashboard', 'Should have Dashboard page');
    assertEqual(page.protected, true, 'Should be protected');
    assertEqual(page.description, 'Main dashboard', 'Should have description');
});

test('IR: Frontend component with props', () => {
    const source = `define structure User
  has id as number

frontend.component "UserCard"
  accepts user as User
  description: "Display user info"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.frontend.components.length, 1, 'Should have 1 component');
    const comp = result.ir.frontend.components[0];
    assertEqual(comp.name, 'UserCard', 'Should have UserCard component');
    assertEqual(comp.props.length, 1, 'Should have 1 prop');
    assertEqual(comp.props[0].name, 'user', 'Should have user prop');
    assertEqual(comp.props[0].type, 'User', 'Should have User type');
});

test('IR: Frontend state', () => {
    const source = 'frontend.state activeTab as "current tab"';
    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.frontend.state.length, 1, 'Should have 1 state');
    assertEqual(result.ir.frontend.state[0].name, 'activeTab', 'Should have activeTab');
    assertEqual(result.ir.frontend.state[0].explanation, 'current tab', 'Should have explanation');
});

test('IR: Frontend theme', () => {
    const source = `frontend.theme "main"
  primaryColor: "#FF0000"
  accentColor: "#00FF00"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.frontend.themes.length, 1, 'Should have 1 theme');
    const theme = result.ir.frontend.themes[0];
    assertEqual(theme.name, 'main', 'Should have main theme');
    assertEqual(theme.properties.primaryColor, '#FF0000', 'Should have primary color');
    assertEqual(theme.properties.accentColor, '#00FF00', 'Should have accent color');
});

test('IR: Backend API', () => {
    const source = `backend.create_api "GetUser"
  description: "Fetch user by ID"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.backend.apis.length, 1, 'Should have 1 API');
    assertEqual(result.ir.backend.apis[0].name, 'GetUser', 'Should have GetUser API');
    assertEqual(result.ir.backend.apis[0].description, 'Fetch user by ID', 'Should have description');
});

test('IR: Backend environment variables', () => {
    const source = 'backend.read_env DATABASE_URL';
    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.backend.env.length, 1, 'Should have 1 env var');
    assertEqual(result.ir.backend.env[0].name, 'DATABASE_URL', 'Should have DATABASE_URL');
});

test('IR: Backend file operations', () => {
    const source = `backend.read_file "config.json"
backend.save_file "output.txt"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.backend.files.reads.length, 1, 'Should have 1 read');
    assertEqual(result.ir.backend.files.writes.length, 1, 'Should have 1 write');
    assertEqual(result.ir.backend.files.reads[0], 'config.json', 'Should read config.json');
    assertEqual(result.ir.backend.files.writes[0], 'output.txt', 'Should write output.txt');
});

test('IR: Import statements', () => {
    const source = `import "shared/types.compose"
import "shared/utils.compose"`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.imports.length, 2, 'Should have 2 imports');
    assertEqual(result.ir.imports[0], 'shared/types.compose', 'Should import types');
    assertEqual(result.ir.imports[1], 'shared/utils.compose', 'Should import utils');
});

test('IR: Context comments', () => {
    const source = `## This is a customer module ##
## Handles customer data ##`;

    const result = compile(source, 'test.compose');

    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.context.length, 2, 'Should have 2 context comments');
    assertEqual(result.ir.context[0], 'This is a customer module', 'Should have first comment');
    assertEqual(result.ir.context[1], 'Handles customer data', 'Should have second comment');
});

test('IR: Complete program', () => {
    const source = `import "shared/types.compose"

## Customer management module ##

define structure Customer
  has id as number
  has name as text

define customers as list of Customer

frontend.page "Customers"
  is protected
  description: "Customer list"

backend.create_api "GetCustomers"
  description: "Fetch all customers"

define function formatName
  inputs: customer as Customer
  returns: text
  description: "Format customer name"`;

    const result = compile(source, 'test.compose');

    assert(result.success, 'Should compile successfully');
    assert(result.ir, 'Should generate IR');
    assertEqual(result.ir.imports.length, 1, 'Should have 1 import');
    assertEqual(result.ir.context.length, 1, 'Should have 1 context comment');
    assertEqual(result.ir.structures.length, 1, 'Should have 1 structure');
    assertEqual(result.ir.variables.length, 1, 'Should have 1 variable');
    assertEqual(result.ir.functions.length, 1, 'Should have 1 function');
    assertEqual(result.ir.frontend.pages.length, 1, 'Should have 1 page');
    assertEqual(result.ir.backend.apis.length, 1, 'Should have 1 API');
});

console.log('\n=== IR Generator Tests Complete ===');

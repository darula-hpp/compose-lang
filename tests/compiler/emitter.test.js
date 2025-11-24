/**
 * Test suite for the Compose emitter
 */

import { loadComposeConfig, validateComposeConfig } from '../../compiler/emitter/compose-config.js';
import { createLLMClient } from '../../compiler/emitter/llm-client.js';
import { emitCode } from '../../compiler/emitter/code-emitter.js';
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

test('Emitter: Load target config', () => {
    const config = loadComposeConfig('./examples/compose.json');

    assert(config.targets, 'Should have targets');
    assert(config.targets.frontend, 'Should have frontend target');
    assert(config.targets.backend, 'Should have backend target');
});

test('Emitter: Validate target config', () => {
    const validConfig = {
        targets: {
            frontend: {
                type: 'react',
                output: './dist'
            }
        }
    };

    assert(validateComposeConfig(validConfig), 'Should validate correct config');
});

test('Emitter: Invalid target type throws', () => {
    const invalidConfig = {
        targets: {
            frontend: {
                type: 'unknown',
                output: './dist'
            }
        }
    };

    try {
        validateComposeConfig(invalidConfig);
        throw new Error('Should have thrown error');
    } catch (error) {
        assert(error.message.includes('invalid type'), 'Should error on invalid type');
    }
});

test('Emitter: Create LLM client', () => {
    const client = createLLMClient();
    assert(client, 'Should create client');
    assert(typeof client.generate === 'function', 'Should have generate method');
});

test('Emitter: Mock client generates component', async () => {
    const client = createLLMClient();
    const code = await client.generate('system', 'Generate a react component\nComponent Name: TestComponent');

    assert(code.includes('TestComponent'), 'Should include component name');
    assert(code.includes('export'), 'Should export component');
});

test('Emitter: Mock client generates page', async () => {
    const client = createLLMClient();
    const code = await client.generate('system', 'Generate a react page\nPage Name: Dashboard\nProtected: Yes');

    assert(code.includes('Dashboard'), 'Should include page name');
    assert(code.includes('Navigate'), 'Should include auth redirect');
});

test('Emitter: Mock client generates API', async () => {
    const client = createLLMClient();
    const code = await client.generate('system', 'Generate a node API endpoint\nAPI Name: GetUsers');

    assert(code.includes('GetUsers'), 'Should include API name');
    assert(code.includes('express'), 'Should use Express');
});

test('Emitter: Emit code from simple IR', async () => {
    const source = `define structure User
  has id as number
  has name as text

frontend.component "UserCard"
  accepts user as User
  description: "Display user"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.frontend);

    assert(result.files, 'Should have files');
    assert(result.files.length > 0, 'Should generate files');
});

test('Emitter: Generate structure file', async () => {
    const source = `define structure Customer
  has id as number
  has name as text`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.frontend);

    const structureFile = result.files.find(f => f.type === 'structure');
    assert(structureFile, 'Should generate structure file');
    assert(structureFile.path.includes('Customer'), 'Should have correct path');
});

test('Emitter: Generate component file', async () => {
    const source = `define structure User
  has id as number

frontend.component "UserCard"
  accepts user as User
  description: "Display user"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.frontend);

    const componentFile = result.files.find(f => f.type === 'component');
    assert(componentFile, 'Should generate component file');
    assert(componentFile.path.includes('UserCard'), 'Should have correct path');
    assert(componentFile.content.includes('UserCard'), 'Should include component name');
});

test('Emitter: Generate page file', async () => {
    const source = `frontend.page "Dashboard"
  is protected
  description: "Main dashboard"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.frontend);

    const pageFile = result.files.find(f => f.type === 'page');
    assert(pageFile, 'Should generate page file');
    assert(pageFile.path.includes('Dashboard'), 'Should have correct path');
    assert(pageFile.content.includes('Dashboard'), 'Should include page name');
});

test('Emitter: Generate API file', async () => {
    const source = `backend.create_api "GetUsers"
  description: "Fetch all users"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.backend);

    const apiFile = result.files.find(f => f.type === 'api');
    assert(apiFile, 'Should generate API file');
    assert(apiFile.path.includes('GetUsers'), 'Should have correct path');
    assert(apiFile.content.includes('GetUsers'), 'Should include API name');
});

test('Emitter: Generate function file', async () => {
    const source = `define function calculateTotal
  inputs: items as list of number
  returns: number
  description: "Sum all items"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.frontend);

    const funcFile = result.files.find(f => f.type === 'function');
    assert(funcFile, 'Should generate function file');
    assert(funcFile.path.includes('calculateTotal'), 'Should have correct path');
});

test('Emitter: Frontend target only generates frontend code', async () => {
    const source = `frontend.component "Card"
  description: "A card"

backend.create_api "GetData"
  description: "Fetch data"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.frontend);

    const hasComponent = result.files.some(f => f.type === 'component');
    const hasAPI = result.files.some(f => f.type === 'api');

    assert(hasComponent, 'Should generate component');
    assert(!hasAPI, 'Should not generate API in frontend target');
});

test('Emitter: Backend target only generates backend code', async () => {
    const source = `frontend.component "Card"
  description: "A card"

backend.create_api "GetData"
  description: "Fetch data"`;

    const compileResult = compile(source, 'test.compose');
    const config = loadComposeConfig('./examples/compose.json');

    const result = await emitCode(compileResult.ir, config.targets.backend);

    const hasComponent = result.files.some(f => f.type === 'component');
    const hasAPI = result.files.some(f => f.type === 'api');

    assert(!hasComponent, 'Should not generate component in backend target');
    assert(hasAPI, 'Should generate API');
});

console.log('\n=== Emitter Tests Complete ===');

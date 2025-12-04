/**
 * Reference Loader Tests
 * Tests for loading and extracting reference code
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { ReferenceLoader } from '../reference-loader.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('ReferenceLoader', () => {
    let testDir;
    let referenceDir;
    let loader;

    beforeEach(() => {
        testDir = join(process.cwd(), '__test_references__');
        referenceDir = join(testDir, 'reference');

        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }

        mkdirSync(referenceDir, { recursive: true });
        loader = new ReferenceLoader(testDir);
    });

    afterEach(() => {
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('parseReferencePath', () => {
        it('should parse basic reference path', () => {
            const result = loader.parseReferencePath('@reference/pricing.py');

            assert.equal(result.file, 'pricing.py');
            assert.equal(result.function, null);
        });

        it('should parse reference path with function', () => {
            const result = loader.parseReferencePath('@reference/pricing.py::calculate_discount');

            assert.equal(result.file, 'pricing.py');
            assert.equal(result.function, 'calculate_discount');
        });

        it('should handle path without @ prefix', () => {
            const result = loader.parseReferencePath('reference/pricing.py::calculate_discount');

            assert.equal(result.file, 'pricing.py');
            assert.equal(result.function, 'calculate_discount');
        });

        it('should handle nested paths', () => {
            const result = loader.parseReferencePath('@reference/utils/validation.js::isEmail');

            assert.equal(result.file, 'utils/validation.js');
            assert.equal(result.function, 'isEmail');
        });

        it('should handle multiple :: separators', () => {
            const result = loader.parseReferencePath('@reference/file.py::Class::method');

            assert.equal(result.file, 'file.py');
            assert.equal(result.function, 'method'); // Takes last segment
        });
    });

    describe('detectLanguage', () => {
        it('should detect Python', () => {
            assert.equal(loader.detectLanguage('script.py'), 'python');
        });

        it('should detect JavaScript', () => {
            assert.equal(loader.detectLanguage('script.js'), 'javascript');
        });

        it('should detect TypeScript', () => {
            assert.equal(loader.detectLanguage('script.ts'), 'typescript');
        });

        it('should detect SQL', () => {
            assert.equal(loader.detectLanguage('queries.sql'), 'sql');
        });

        it('should return unknown for unsupported extensions', () => {
            assert.equal(loader.detectLanguage('file.xyz'), 'unknown');
        });
    });

    describe('loadFile', () => {
        it('should load file content', () => {
            const filePath = join(referenceDir, 'test.py');
            writeFileSync(filePath, 'print("hello")');

            const content = loader.loadFile(filePath);

            assert.equal(content, 'print("hello")');
        });

        it('should cache loaded files', () => {
            const filePath = join(referenceDir, 'test.py');
            writeFileSync(filePath, 'original');

            const content1 = loader.loadFile(filePath);

            // Modify file
            writeFileSync(filePath, 'modified');

            // Should return cached version
            const content2 = loader.loadFile(filePath);

            assert.equal(content1, 'original');
            assert.equal(content2, 'original'); // Still cached
        });

        it('should allow cache clearing', () => {
            const filePath = join(referenceDir, 'test.py');
            writeFileSync(filePath, 'original');

            loader.loadFile(filePath);
            loader.clearCache();

            writeFileSync(filePath, 'modified');
            const content = loader.loadFile(filePath);

            assert.equal(content, 'modified');
        });
    });

    describe('loadReference', () => {
        it('should load entire file when no function specified', () => {
            const filePath = join(referenceDir, 'pricing.py');
            writeFileSync(filePath, 'def calculate(): pass\ndef process(): pass');

            const result = loader.loadReference('@reference/pricing.py');

            assert.ok(result);
            assert.equal(result.content, 'def calculate(): pass\ndef process(): pass');
            assert.equal(result.language, 'python');
            assert.equal(result.function, null);
            assert.equal(result.path, 'pricing.py');
        });

        it('should return null for missing file', () => {
            const result = loader.loadReference('@reference/nonexistent.py');

            assert.equal(result, null);
        });

        it('should extract Python function', () => {
            const filePath = join(referenceDir, 'pricing.py');
            const code = `def calculate_discount(amount, years):
    if years >= 5:
        return amount * 0.15
    return 0

def other_function():
    pass`;
            writeFileSync(filePath, code);

            const result = loader.loadReference('@reference/pricing.py::calculate_discount');

            assert.ok(result);
            assert.ok(result.content.includes('def calculate_discount'));
            assert.ok(result.content.includes('return amount * 0.15'));
            assert.ok(!result.content.includes('def other_function'));
            assert.equal(result.function, 'calculate_discount');
        });
    });

    describe('extractPythonFunction', () => {
        it('should extract simple function', () => {
            const code = `def calculate_discount(amount):
    return amount * 0.10`;

            const result = loader.extractPythonFunction(code, 'calculate_discount');

            assert.ok(result);
            assert.ok(result.includes('def calculate_discount'));
            assert.ok(result.includes('return amount * 0.10'));
        });

        it('should extract function with multiple lines', () => {
            const code = `def process_order(order):
    total = 0
    for item in order.items:
        total += item.price
    return total

def other():
    pass`;

            const result = loader.extractPythonFunction(code, 'process_order');

            assert.ok(result);
            assert.ok(result.includes('def process_order'));
            assert.ok(result.includes('for item in order.items'));
            assert.ok(!result.includes('def other'));
        });

        it('should handle async functions', () => {
            const code = `async def fetch_data():
    data = await get_data()
    return data`;

            const result = loader.extractPythonFunction(code, 'fetch_data');

            assert.ok(result);
            assert.ok(result.includes('async def fetch_data'));
        });

        it('should return null for missing function', () => {
            const code = 'def other(): pass';

            const result = loader.extractPythonFunction(code, 'nonexistent');

            assert.equal(result, null);
        });

        it('should handle nested indentation', () => {
            const code = `def outer():
    def inner():
        return 42
    return inner()

def next_function():
    pass`;

            const result = loader.extractPythonFunction(code, 'outer');

            assert.ok(result);
            assert.ok(result.includes('def outer'));
            assert.ok(result.includes('def inner'));
            assert.ok(!result.includes('def next_function'));
        });
    });

    describe('extractJSFunction', () => {
        it('should extract function declaration', () => {
            const code = `function calculateDiscount(amount) {
    return amount * 0.10;
}`;

            const result = loader.extractJSFunction(code, 'calculateDiscount');

            assert.ok(result);
            assert.ok(result.includes('function calculateDiscount'));
            assert.ok(result.includes('return amount * 0.10'));
        });

        it('should extract arrow function', () => {
            const code = `const calculateDiscount = (amount) => {
    return amount * 0.10;
};`;

            const result = loader.extractJSFunction(code, 'calculateDiscount');

            assert.ok(result);
            assert.ok(result.includes('calculateDiscount'));
        });

        it('should extract exported function', () => {
            const code = `export function calculateDiscount(amount) {
    return amount * 0.10;
}`;

            const result = loader.extractJSFunction(code, 'calculateDiscount');

            assert.ok(result);
            assert.ok(result.includes('export function calculateDiscount'));
        });

        it('should handle nested braces', () => {
            const code = `function process(data) {
    if (data) {
        return { value: data };
    }
    return null;
}`;

            const result = loader.extractJSFunction(code, 'process');

            assert.ok(result);
            assert.ok(result.includes('if (data)'));
            assert.ok(result.includes('return null'));
        });
    });

    describe('extractSQLFunction', () => {
        it('should extract SQL function', () => {
            const code = `CREATE FUNCTION calculate_total(order_id INT)
RETURNS DECIMAL
BEGIN
    DECLARE total DECIMAL;
    SELECT SUM(price) INTO total FROM items WHERE order_id = order_id;
    RETURN total;
END;`;

            const result = loader.extractSQLFunction(code, 'calculate_total');

            assert.ok(result);
            assert.ok(result.includes('CREATE FUNCTION calculate_total'));
            assert.ok(result.includes('RETURN total'));
        });

        it('should handle CREATE OR REPLACE', () => {
            const code = `CREATE OR REPLACE FUNCTION get_discount()
RETURNS INT AS $$
BEGIN
    RETURN 10;
END;
$$;`;

            const result = loader.extractSQLFunction(code, 'get_discount');

            assert.ok(result);
            assert.ok(result.includes('CREATE OR REPLACE FUNCTION get_discount'));
        });
    });
});

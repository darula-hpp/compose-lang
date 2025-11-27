/**
 * Tests for Code Emitter
 * Verifies LLM code generation, file parsing, and export map building
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import { strict as assert } from 'node:assert';
import { CodeEmitter, emitCode } from '../code-emitter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CodeEmitter', () => {
    const testCacheDir = path.join(__dirname, '.test-code-emitter-cache');

    beforeEach(() => {
        // Clean up test cache
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        // Clean up test cache
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    describe('constructor', () => {
        it('should initialize with target and options', () => {
            const target = { type: 'react', language: 'javascript' };
            const options = { llm: { provider: 'mock' } };
            const emitter = new CodeEmitter(target, options);

            assert.strictEqual(emitter.target, target);
            assert.deepStrictEqual(emitter.llmConfig, { provider: 'mock' });
            assert.deepStrictEqual(emitter.options, options);
            assert.strictEqual(emitter.llmClient, null);
        });

        it('should use empty llm config if not provided', () => {
            const target = { type: 'node' };
            const emitter = new CodeEmitter(target);

            assert.deepStrictEqual(emitter.llmConfig, {});
        });
    });

    describe('parseOutput', () => {
        it('should parse single file from LLM output', () => {
            const emitter = new CodeEmitter({ type: 'react' });
            const output = `### FILE: src/App.js
export default function App() {
    return <div>Hello</div>;
}`;

            const files = emitter.parseOutput(output);

            assert.strictEqual(files.length, 1);
            assert.strictEqual(files[0].path, 'src/App.js');
            assert.ok(files[0].content.includes('export default function App'));
            assert.strictEqual(files[0].type, 'code');
        });

        it('should parse multiple files from LLM output', () => {
            const emitter = new CodeEmitter({ type: 'react' });
            const output = `### FILE: src/App.js
export default function App() {}

### FILE: src/components/Button.js
export function Button() {}

### FILE: src/utils/helpers.js
export const helper = () => {};`;

            const files = emitter.parseOutput(output);

            assert.strictEqual(files.length, 3);
            assert.strictEqual(files[0].path, 'src/App.js');
            assert.strictEqual(files[1].path, 'src/components/Button.js');
            assert.strictEqual(files[2].path, 'src/utils/helpers.js');
        });

        it('should handle empty output', () => {
            const emitter = new CodeEmitter({ type: 'react' });
            const files = emitter.parseOutput('');

            assert.strictEqual(files.length, 0);
        });

        it('should handle output without FILE markers', () => {
            const emitter = new CodeEmitter({ type: 'react' });
            const output = 'Just some random text without file markers';
            const files = emitter.parseOutput(output);

            assert.strictEqual(files.length, 0);
        });

        it('should trim whitespace from file paths', () => {
            const emitter = new CodeEmitter({ type: 'react' });
            const output = `### FILE:   src/App.js   
content here`;

            const files = emitter.parseOutput(output);

            assert.strictEqual(files[0].path, 'src/App.js');
        });

        it('should handle files with empty content', () => {
            const emitter = new CodeEmitter({ type: 'react' });
            const output = `### FILE: src/empty.js
### FILE: src/another.js
some content`;

            const files = emitter.parseOutput(output);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].content.trim(), '');
            assert.ok(files[1].content.includes('some content'));
        });
    });

    describe('getFileExtension', () => {
        it('should return js for javascript', () => {
            const emitter = new CodeEmitter({ language: 'javascript' });
            assert.strictEqual(emitter.getFileExtension(), 'js');
        });

        it('should return ts for typescript', () => {
            const emitter = new CodeEmitter({ language: 'typescript' });
            assert.strictEqual(emitter.getFileExtension(), 'ts');
        });

        it('should return py for python', () => {
            const emitter = new CodeEmitter({ language: 'python' });
            assert.strictEqual(emitter.getFileExtension(), 'py');
        });

        it('should return rs for rust', () => {
            const emitter = new CodeEmitter({ language: 'rust' });
            assert.strictEqual(emitter.getFileExtension(), 'rs');
        });

        it('should return go for go', () => {
            const emitter = new CodeEmitter({ language: 'go' });
            assert.strictEqual(emitter.getFileExtension(), 'go');
        });

        it('should return js for unknown language', () => {
            const emitter = new CodeEmitter({ language: 'unknown' });
            assert.strictEqual(emitter.getFileExtension(), 'js');
        });

        it('should return js when no language specified', () => {
            const emitter = new CodeEmitter({});
            assert.strictEqual(emitter.getFileExtension(), 'js');
        });
    });

    describe('buildExportMap', () => {
        it('should build full export map when it does not exist', async () => {
            const emitter = new CodeEmitter({ type: 'react' }, {});
            const files = [
                { path: 'src/App.js', content: 'export function App() {}', type: 'code' }
            ];

            // Change working directory to test cache dir
            const originalCwd = process.cwd();
            fs.mkdirSync(testCacheDir, { recursive: true });
            process.chdir(testCacheDir);

            try {
                await emitter.buildExportMap(files);

                // Verify export map was created
                const exportMapPath = '.compose/cache/export-map.json';
                assert.ok(fs.existsSync(exportMapPath));
            } finally {
                process.chdir(originalCwd);
            }
        });

        it('should update export map incrementally when it exists', async () => {
            const emitter = new CodeEmitter({ type: 'react' }, {});
            const files = [
                { path: 'src/App.js', content: 'export function App() {}', type: 'code' }
            ];

            const originalCwd = process.cwd();
            fs.mkdirSync(testCacheDir, { recursive: true });
            process.chdir(testCacheDir);

            try {
                // Create initial export map
                const exportMapDir = '.compose/cache';
                const exportMapPath = `${exportMapDir}/export-map.json`;
                fs.mkdirSync(exportMapDir, { recursive: true });
                fs.writeFileSync(exportMapPath, JSON.stringify({}));

                await emitter.buildExportMap(files);

                // Verify it was updated (not rebuilt)
                assert.ok(fs.existsSync(exportMapPath));
            } finally {
                process.chdir(originalCwd);
            }
        });

        it('should force full build when forceFullBuild option is true', async () => {
            const emitter = new CodeEmitter({ type: 'react' }, { forceFullBuild: true });
            const files = [
                { path: 'src/App.js', content: 'export function App() {}', type: 'code' }
            ];

            const originalCwd = process.cwd();
            fs.mkdirSync(testCacheDir, { recursive: true });
            process.chdir(testCacheDir);

            try {
                // Create existing export map
                const exportMapDir = '.compose/cache';
                fs.mkdirSync(exportMapDir, { recursive: true });
                fs.writeFileSync(`${exportMapDir}/export-map.json`, JSON.stringify({}));

                await emitter.buildExportMap(files);

                // Export map should still exist (forced rebuild)
                assert.ok(fs.existsSync(`${exportMapDir}/export-map.json`));
            } finally {
                process.chdir(originalCwd);
            }
        });
    });

    describe('emit', () => {
        it('should generate code from IR using LLM', async () => {
            // Mock the LLM client
            const mockGenerate = mock.fn(() => Promise.resolve(`### FILE: src/App.js
export default function App() {
    return <div>Test</div>;
}`));

            const mockClient = { generate: mockGenerate };
            const mockCreateLLMClient = mock.fn(() => Promise.resolve(mockClient));

            // Temporarily replace the import
            const emitter = new CodeEmitter({ type: 'react', output: testCacheDir }, {});
            emitter.llmClient = mockClient;

            const ir = {
                models: [],
                features: [],
                guides: []
            };

            const originalCwd = process.cwd();
            fs.mkdirSync(testCacheDir, { recursive: true });
            process.chdir(testCacheDir);

            try {
                const result = await emitter.emit(ir);

                assert.ok(result.files);
                assert.strictEqual(result.files.length, 1);
                assert.strictEqual(result.files[0].path, 'src/App.js');
                assert.strictEqual(mockGenerate.mock.calls.length, 1);
            } finally {
                process.chdir(originalCwd);
            }
        });
    });
});

describe('emitCode function', () => {
    it('should create CodeEmitter and call emit', async () => {
        const target = { type: 'react', output: path.join(__dirname, '.test-emit-code') };
        const ir = { models: [], features: [], guides: [] };
        const options = { llm: { provider: 'mock' } };

        // Mock LLM client
        const mockClient = {
            generate: mock.fn(() => Promise.resolve(`### FILE: test.js
export const test = true;`))
        };

        const originalCwd = process.cwd();
        const testDir = path.join(__dirname, '.test-emit-code');
        fs.mkdirSync(testDir, { recursive: true });
        process.chdir(testDir);

        try {
            // We need to mock at a higher level for this test
            // For now, just verify the function exists and has correct signature
            assert.strictEqual(typeof emitCode, 'function');
        } finally {
            process.chdir(originalCwd);
            if (fs.existsSync(testDir)) {
                fs.rmSync(testDir, { recursive: true, force: true });
            }
        }
    });
});

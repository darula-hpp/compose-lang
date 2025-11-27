/**
 * Tests for Output Writer
 * Verifies file writing, directory creation, and project scaffolding
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { OutputWriter, writeOutput } from '../output-writer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('OutputWriter', () => {
    const testOutputDir = path.join(__dirname, '.test-output-writer');

    beforeEach(() => {
        // Clean up test directory
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(testOutputDir, { recursive: true });
    });

    afterEach(() => {
        // Clean up test directory
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
    });

    describe('constructor', () => {
        it('should initialize with base output directory', () => {
            const writer = new OutputWriter(testOutputDir);
            assert.strictEqual(writer.baseOutputDir, testOutputDir);
        });
    });

    describe('writeFile', () => {
        it('should write a single file', () => {
            const writer = new OutputWriter(testOutputDir);
            const file = {
                path: 'test.js',
                content: 'console.log("hello");',
                type: 'code'
            };

            writer.writeFile(file);

            const filePath = path.join(testOutputDir, 'test.js');
            assert.ok(fs.existsSync(filePath));
            const content = fs.readFileSync(filePath, 'utf8');
            assert.strictEqual(content, 'console.log("hello");');
        });

        it('should create directories if needed', () => {
            const writer = new OutputWriter(testOutputDir);
            const file = {
                path: 'src/components/Button.js',
                content: 'export const Button = () => {};',
                type: 'code'
            };

            writer.writeFile(file);

            const filePath = path.join(testOutputDir, 'src/components/Button.js');
            assert.ok(fs.existsSync(filePath));
        });

        it('should write with UTF-8 encoding', () => {
            const writer = new OutputWriter(testOutputDir);
            const file = {
                path: 'unicode.txt',
                content: '你好世界 🌍',
                type: 'text'
            };

            writer.writeFile(file);

            const filePath = path.join(testOutputDir, 'unicode.txt');
            const content = fs.readFileSync(filePath, 'utf8');
            assert.strictEqual(content, '你好世界 🌍');
        });
    });

    describe('write', () => {
        it('should write multiple files successfully', () => {
            const writer = new OutputWriter(testOutputDir);
            const files = [
                { path: 'file1.js', content: 'content 1', type: 'code' },
                { path: 'file2.js', content: 'content 2', type: 'code' },
                { path: 'src/file3.js', content: 'content 3', type: 'code' }
            ];

            const result = writer.write(files);

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.written.length, 3);
            assert.strictEqual(result.errors.length, 0);
            assert.ok(fs.existsSync(path.join(testOutputDir, 'file1.js')));
            assert.ok(fs.existsSync(path.join(testOutputDir, 'file2.js')));
            assert.ok(fs.existsSync(path.join(testOutputDir, 'src/file3.js')));
        });

        it('should handle write errors gracefully', () => {
            const writer = new OutputWriter('/invalid/path/that/cannot/exist');
            const files = [
                { path: 'test.js', content: 'content', type: 'code' }
            ];

            const result = writer.write(files);

            assert.strictEqual(result.success, false);
            assert.strictEqual(result.errors.length, 1);
            assert.strictEqual(result.errors[0].path, 'test.js');
            assert.ok(result.errors[0].error);
        });

        it('should normalize paths correctly', () => {
            const writer = new OutputWriter(testOutputDir);
            const files = [
                { path: `${path.basename(testOutputDir)}/src/App.js`, content: 'content', type: 'code' }
            ];

            const result = writer.write(files);

            assert.strictEqual(result.success, true);
            // Should strip the baseOutputDir prefix
            assert.ok(result.written[0].includes('src/App.js'));
        });
    });

    describe('generateScripts', () => {
        it('should generate Vite scripts', () => {
            const writer = new OutputWriter(testOutputDir);
            const scripts = writer.generateScripts({ framework: 'vite' });

            assert.strictEqual(scripts.dev, 'vite');
            assert.strictEqual(scripts.build, 'vite build');
            assert.strictEqual(scripts.preview, 'vite preview');
        });

        it('should generate Node.js scripts', () => {
            const writer = new OutputWriter(testOutputDir);
            const scripts = writer.generateScripts({ type: 'node' });

            assert.strictEqual(scripts.start, 'node index.js');
            assert.strictEqual(scripts.dev, 'nodemon index.js');
        });

        it('should generate default scripts', () => {
            const writer = new OutputWriter(testOutputDir);
            const scripts = writer.generateScripts({ type: 'other' });

            assert.strictEqual(scripts.start, 'node index.js');
        });
    });

    describe('generateDependencies', () => {
        it('should generate dependencies from target', () => {
            const writer = new OutputWriter(testOutputDir);
            const deps = writer.generateDependencies({
                dependencies: ['react', 'react-dom', 'express']
            });

            assert.strictEqual(deps.react, 'latest');
            assert.strictEqual(deps['react-dom'], 'latest');
            assert.strictEqual(deps.express, 'latest');
        });

        it('should return empty object when no dependencies', () => {
            const writer = new OutputWriter(testOutputDir);
            const deps = writer.generateDependencies({});

            assert.deepStrictEqual(deps, {});
        });
    });

    describe('generateDevDependencies', () => {
        it('should include Vite dev dependencies', () => {
            const writer = new OutputWriter(testOutputDir);
            const devDeps = writer.generateDevDependencies({ framework: 'vite' });

            assert.strictEqual(devDeps.vite, 'latest');
            assert.strictEqual(devDeps['@vitejs/plugin-react'], 'latest');
        });

        it('should include Node.js dev dependencies', () => {
            const writer = new OutputWriter(testOutputDir);
            const devDeps = writer.generateDevDependencies({ type: 'node' });

            assert.strictEqual(devDeps.nodemon, 'latest');
        });

        it('should return empty object for other types', () => {
            const writer = new OutputWriter(testOutputDir);
            const devDeps = writer.generateDevDependencies({ type: 'other' });

            assert.deepStrictEqual(devDeps, {});
        });
    });

    describe('writePackageJson', () => {
        it('should create package.json with correct structure', () => {
            const writer = new OutputWriter(testOutputDir);
            const target = {
                type: 'react',
                framework: 'vite',
                moduleSystem: 'module'
            };

            writer.writePackageJson(target, 'test-app');

            const pkgPath = path.join(testOutputDir, 'package.json');
            assert.ok(fs.existsSync(pkgPath));

            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            assert.strictEqual(pkg.name, 'test-app');
            assert.strictEqual(pkg.version, '1.0.0');
            assert.strictEqual(pkg.type, 'module');
            assert.ok(pkg.scripts);
            assert.ok(pkg.dependencies);
            assert.ok(pkg.devDependencies);
        });

        it('should use default project name if not provided', () => {
            const writer = new OutputWriter(testOutputDir);
            writer.writePackageJson({ type: 'node' });

            const pkg = JSON.parse(fs.readFileSync(path.join(testOutputDir, 'package.json'), 'utf8'));
            assert.strictEqual(pkg.name, 'compose-generated-app');
        });

        it('should include framework-specific scripts', () => {
            const writer = new OutputWriter(testOutputDir);
            writer.writePackageJson({ framework: 'vite' });

            const pkg = JSON.parse(fs.readFileSync(path.join(testOutputDir, 'package.json'), 'utf8'));
            assert.strictEqual(pkg.scripts.dev, 'vite');
        });
    });

    describe('writeReadme', () => {
        it('should create README.md with project info', () => {
            const writer = new OutputWriter(testOutputDir);
            const target = {
                type: 'react',
                framework: 'vite',
                language: 'javascript'
            };

            writer.writeReadme('My Project', target);

            const readmePath = path.join(testOutputDir, 'README.md');
            assert.ok(fs.existsSync(readmePath));

            const content = fs.readFileSync(readmePath, 'utf8');
            assert.ok(content.includes('# My Project'));
            assert.ok(content.includes('Type: react'));
            assert.ok(content.includes('Framework: vite'));
            assert.ok(content.includes('Language: javascript'));
            assert.ok(content.includes('npm install'));
            assert.ok(content.includes('npm run dev'));
        });

        it('should handle projects without framework', () => {
            const writer = new OutputWriter(testOutputDir);
            const target = {
                type: 'node',
                language: 'javascript'
            };

            writer.writeReadme('Node App', target);

            const content = fs.readFileSync(path.join(testOutputDir, 'README.md'), 'utf8');
            assert.ok(content.includes('Framework: none'));
        });
    });
});

describe('writeOutput function', () => {
    const testOutputDir = path.join(__dirname, '.test-write-output');

    beforeEach(() => {
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(testOutputDir, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
    });

    it('should write files and create package.json and README', () => {
        const files = [
            { path: 'src/index.js', content: 'console.log("test");', type: 'code' }
        ];
        const target = {
            type: 'node',
            language: 'javascript'
        };

        const result = writeOutput(files, testOutputDir, target);

        assert.strictEqual(result.success, true);
        assert.ok(fs.existsSync(path.join(testOutputDir, 'src/index.js')));
        assert.ok(fs.existsSync(path.join(testOutputDir, 'package.json')));
        assert.ok(fs.existsSync(path.join(testOutputDir, 'README.md')));
    });

    it('should return write result with error handling', () => {
        const files = [
            { path: 'test.js', content: 'content', type: 'code' }
        ];
        const target = { type: 'node' };

        const result = writeOutput(files, testOutputDir, target);

        assert.ok(result.success !== undefined);
        assert.ok(result.written);
        assert.ok(result.errors);
    });
});

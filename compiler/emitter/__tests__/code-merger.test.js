/**
 * Tests for Code Merger
 * Verifies file path handling and directory structure
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { mergeCode } from '../code-merger.js';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Code Merger', () => {
    const testOutputDir = '/tmp/compose-test-output';

    function cleanupTestDir() {
        if (existsSync(testOutputDir)) {
            rmSync(testOutputDir, { recursive: true, force: true });
        }
    }

    it('should not create nested directories when LLM includes output path in file paths', () => {
        cleanupTestDir();
        mkdirSync(testOutputDir, { recursive: true });

        // Simulate LLM output where file paths include the output directory
        const generatedFiles = [
            {
                path: 'generated/web/src/App.jsx',
                content: 'export default function App() {}',
                type: 'code'
            },
            {
                path: 'generated/web/src/components/Button.jsx',
                content: 'export default function Button() {}',
                type: 'code'
            }
        ];

        const frameworkInfo = { framework: 'none' };
        const targetDir = join(testOutputDir, 'generated/web');

        // This should write to: /tmp/compose-test-output/generated/web/src/App.jsx
        // NOT to: /tmp/compose-test-output/generated/web/generated/web/src/App.jsx
        mergeCode(generatedFiles, frameworkInfo, targetDir, `${testOutputDir}/.compose/cache`);

        // Verify files are in correct location (not nested)
        const correctPath = join(testOutputDir, 'generated/web/src/App.jsx');
        const incorrectPath = join(testOutputDir, 'generated/web/generated/web/src/App.jsx');

        assert.ok(existsSync(correctPath), `File should exist at ${correctPath}`);
        assert.ok(!existsSync(incorrectPath), `File should NOT exist at nested path ${incorrectPath}`);

        cleanupTestDir();
    });

    it('should handle file paths without output directory prefix correctly', () => {
        cleanupTestDir();
        mkdirSync(testOutputDir, { recursive: true });

        // Simulate correct LLM output (no output directory in paths)
        const generatedFiles = [
            {
                path: 'src/App.jsx',
                content: 'export default function App() {}',
                type: 'code'
            }
        ];

        const frameworkInfo = { framework: 'none' };
        const targetDir = join(testOutputDir, 'output');

        mergeCode(generatedFiles, frameworkInfo, targetDir, `${testOutputDir}/.compose/cache`);

        const correctPath = join(testOutputDir, 'output/src/App.jsx');
        assert.ok(existsSync(correctPath), `File should exist at ${correctPath}`);

        cleanupTestDir();
    });

    it('should strip common output path prefix from generated file paths', () => {
        cleanupTestDir();
        mkdirSync(testOutputDir, { recursive: true });

        const generatedFiles = [
            { path: './generated/web/index.js', content: 'console.log("test")', type: 'code' },
            { path: 'generated/web/package.json', content: '{}', type: 'code' },
            { path: '/generated/web/README.md', content: '# Test', type: 'code' }
        ];

        const frameworkInfo = { framework: 'none' };
        const targetDir = join(testOutputDir, 'generated/web');

        mergeCode(generatedFiles, frameworkInfo, targetDir, `${testOutputDir}/.compose/cache`);

        // All should be at root of targetDir, not nested
        assert.ok(existsSync(join(testOutputDir, 'generated/web/index.js')));
        assert.ok(existsSync(join(testOutputDir, 'generated/web/package.json')));
        assert.ok(existsSync(join(testOutputDir, 'generated/web/README.md')));

        // Should NOT be nested
        assert.ok(!existsSync(join(testOutputDir, 'generated/web/generated/web/index.js')));

        cleanupTestDir();
    });

    it('should handle Next.js app directory structure without nesting', () => {
        cleanupTestDir();
        mkdirSync(testOutputDir, { recursive: true });

        // Simulate Next.js app directory files with output prefix
        const generatedFiles = [
            {
                path: 'generated/web/app/page.tsx',
                content: 'export default function Page() {}',
                type: 'code'
            },
            {
                path: 'generated/web/app/layout.tsx',
                content: 'export default function Layout() {}',
                type: 'code'
            },
            {
                path: 'generated/web/package.json',
                content: '{"name": "test"}',
                type: 'code'
            }
        ];

        const frameworkInfo = { framework: 'next' };
        const targetDir = join(testOutputDir, 'generated/web');

        mergeCode(generatedFiles, frameworkInfo, targetDir, `${testOutputDir}/.compose/cache`);

        // Check files are in correct location
        assert.ok(existsSync(join(testOutputDir, 'generated/web/app/page.tsx')));
        assert.ok(existsSync(join(testOutputDir, 'generated/web/app/layout.tsx')));
        assert.ok(existsSync(join(testOutputDir, 'generated/web/package.json')));

        // Verify NO nested directories
        assert.ok(!existsSync(join(testOutputDir, 'generated/web/generated')));

        cleanupTestDir();
    });
});

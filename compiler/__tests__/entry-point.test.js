/**
 * Entry Point Tests
 * Tests for entry point validation and multi-target entry points
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { loadComposeConfig, validateComposeConfig } from '../emitter/compose-config.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

// Helper to create a minimal valid config
function createValidConfig(targets) {
    return {
        llm: {
            provider: 'gemini',
            model: 'gemini-2.0-flash-exp',
            apiKey: '${GEMINI_API_KEY}'
        },
        targets
    };
}

// Helper to create a minimal .compose file
function createComposeFile(testDir, path) {
    const fullPath = join(testDir, path);
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    if (dir && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, 'model Test:\n  id: number\n');
}

describe('Entry Point Validation', () => {
    let testDir;

    beforeEach(() => {
        testDir = join(process.cwd(), '__test_entry_points__');
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
        mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('Single Target Entry Points', () => {
        it('should load config with valid entry point', () => {
            // Create entry file
            createComposeFile(testDir, './app.compose');

            const config = createValidConfig({
                web: {
                    entry: './app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated/web'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.ok(loaded);
            assert.ok(loaded.targets.web);
            assert.equal(loaded.targets.web.entry, './app.compose');
        });

        it('should accept entry point without ./ prefix', () => {
            createComposeFile(testDir, 'app.compose');

            const config = createValidConfig({
                web: {
                    entry: 'app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.equal(loaded.targets.web.entry, 'app.compose');
        });

        it('should accept entry point with subdirectory', () => {
            createComposeFile(testDir, './src/api.compose');

            const config = createValidConfig({
                api: {
                    entry: './src/api.compose',
                    language: 'typescript',
                    framework: 'express',
                    output: './generated/api'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.equal(loaded.targets.api.entry, './src/api.compose');
        });
    });

    describe('Multi-Target Entry Points', () => {
        it('should support different entry points for different targets', () => {
            createComposeFile(testDir, './src/frontend/app.compose');
            createComposeFile(testDir, './src/backend/api.compose');

            const config = createValidConfig({
                web: {
                    entry: './src/frontend/app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated/web'
                },
                api: {
                    entry: './src/backend/api.compose',
                    language: 'typescript',
                    framework: 'express',
                    output: './generated/api'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.equal(loaded.targets.web.entry, './src/frontend/app.compose');
            assert.equal(loaded.targets.api.entry, './src/backend/api.compose');
        });

        it('should support multiple targets with different frameworks', () => {
            createComposeFile(testDir, './web/app.compose');
            createComposeFile(testDir, './mobile/app.compose');
            createComposeFile(testDir, './api/server.compose');

            const config = createValidConfig({
                web: {
                    entry: './web/app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated/web'
                },
                mobile: {
                    entry: './mobile/app.compose',
                    language: 'typescript',
                    framework: 'react-native',
                    output: './generated/mobile'
                },
                api: {
                    entry: './api/server.compose',
                    language: 'typescript',
                    framework: 'express',
                    output: './generated/api'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.equal(Object.keys(loaded.targets).length, 3);
            assert.equal(loaded.targets.web.entry, './web/app.compose');
            assert.equal(loaded.targets.mobile.entry, './mobile/app.compose');
            assert.equal(loaded.targets.api.entry, './api/server.compose');
        });

        it('should allow shared models with different entry points', () => {
            // This represents a common pattern where shared models are imported
            // by different target entry points
            createComposeFile(testDir, './frontend/app.compose');
            createComposeFile(testDir, './backend/api.compose');

            const config = createValidConfig({
                frontend: {
                    entry: './frontend/app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated/frontend'
                },
                backend: {
                    entry: './backend/api.compose',
                    language: 'typescript',
                    framework: 'express',
                    output: './generated/backend'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            // Both targets should have their own entry points
            assert.ok(loaded.targets.frontend.entry);
            assert.ok(loaded.targets.backend.entry);
            assert.notEqual(loaded.targets.frontend.entry, loaded.targets.backend.entry);
        });
    });

    describe('Entry Point Patterns', () => {
        it('should support Pattern 1: Shared Models', () => {
            // Pattern from documentation where main app imports shared models
            createComposeFile(testDir, './app.compose');

            const config = createValidConfig({
                web: {
                    entry: './app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.equal(loaded.targets.web.entry, './app.compose');
        });

        it('should support Pattern 2: Feature Modules', () => {
            // Entry point imports all feature modules
            createComposeFile(testDir, './app.compose');

            const config = createValidConfig({
                web: {
                    entry: './app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.ok(loaded.targets.web.entry);
        });

        it('should support Pattern 3: Multi-Target Shared', () => {
            // Different targets share common type definitions
            createComposeFile(testDir, './frontend/app.compose');
            createComposeFile(testDir, './backend/api.compose');

            const config = createValidConfig({
                web: {
                    entry: './frontend/app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated/web'
                },
                api: {
                    entry: './backend/api.compose',
                    language: 'typescript',
                    framework: 'express',
                    output: './generated/api'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.ok(loaded.targets.web.entry);
            assert.ok(loaded.targets.api.entry);
        });
    });

    describe('Entry Point Edge Cases', () => {
        it('should handle entry point with .compose extension', () => {
            createComposeFile(testDir, './main.compose');

            const config = createValidConfig({
                web: {
                    entry: './main.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.ok(loaded.targets.web.entry.endsWith('.compose'));
        });

        it('should handle entry point without extension', () => {
            createComposeFile(testDir, './main');

            const config = createValidConfig({
                web: {
                    entry: './main',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            // Extension can be added by the loader
            assert.ok(loaded.targets.web.entry);
        });

        it('should handle nested directory structure', () => {
            createComposeFile(testDir, './src/apps/main/app.compose');

            const config = createValidConfig({
                web: {
                    entry: './src/apps/main/app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            const loaded = loadComposeConfig(join(testDir, 'compose.json'));

            assert.equal(loaded.targets.web.entry, './src/apps/main/app.compose');
        });
    });

    describe('Entry Point Requirement', () => {
        it('should require entry point in config', () => {
            const config = createValidConfig({
                web: {
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                    // No entry point
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            // Should throw because entry is required
            assert.throws(() => {
                loadComposeConfig(join(testDir, 'compose.json'));
            }, /Missing required field "entry"/);
        });

        it('should require entry file to exist', () => {
            const config = createValidConfig({
                web: {
                    entry: './nonexistent.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            writeFileSync(join(testDir, 'compose.json'), JSON.stringify(config, null, 2));

            // Should throw because file doesn't exist
            assert.throws(() => {
                loadComposeConfig(join(testDir, 'compose.json'));
            }, /Entry file not found/);
        });

        it('should validate with skipFileChecks option', () => {
            const config = createValidConfig({
                web: {
                    entry: './app.compose',
                    language: 'typescript',
                    framework: 'nextjs',
                    output: './generated'
                }
            });

            // Validate without checking if files exist
            const errors = validateComposeConfig(config, testDir, true);

            assert.equal(errors.length, 0, 'Should have no validation errors with skipFileChecks');
        });
    });
});

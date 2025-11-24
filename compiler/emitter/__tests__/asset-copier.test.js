/**
 * Asset Copier Tests
 * Tests for asset copying functionality
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { copyAssets } from '../asset-copier.js';
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Asset Copier', () => {
    let testDir;

    beforeEach(() => {
        // Create temporary test directory
        testDir = join(tmpdir(), `compose-test-${Date.now()}`);
        mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        // Clean up test directory
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('Single File Copying', () => {
        it('should copy a single file', () => {
            // Setup
            const assetsDir = join(testDir, 'assets');
            mkdirSync(assetsDir);
            writeFileSync(join(assetsDir, 'logo.svg'), '<svg>Logo</svg>');

            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['assets/logo.svg', 'public/logo.svg']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert
            const copiedFile = join(outputDir, 'public/logo.svg');
            assert.ok(existsSync(copiedFile));
            assert.equal(readFileSync(copiedFile, 'utf8'), '<svg>Logo</svg>');
        });

        it('should create destination directories', () => {
            // Setup
            const assetsDir = join(testDir, 'assets');
            mkdirSync(assetsDir);
            writeFileSync(join(assetsDir, 'icon.png'), 'PNG DATA');

            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['assets/icon.png', 'public/images/icons/icon.png']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert
            const copiedFile = join(outputDir, 'public/images/icons/icon.png');
            assert.ok(existsSync(copiedFile));
        });
    });

    describe('Directory Copying', () => {
        it('should copy an entire directory', () => {
            // Setup
            const assetsDir = join(testDir, 'assets/images');
            mkdirSync(assetsDir, { recursive: true });
            writeFileSync(join(assetsDir, 'photo1.jpg'), 'PHOTO1');
            writeFileSync(join(assetsDir, 'photo2.jpg'), 'PHOTO2');

            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['assets/images', 'public/images']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert
            assert.ok(existsSync(join(outputDir, 'public/images/photo1.jpg')));
            assert.ok(existsSync(join(outputDir, 'public/images/photo2.jpg')));
        });

        it('should copy nested directory structure', () => {
            // Setup
            const iconsDir = join(testDir, 'assets/images/icons');
            mkdirSync(iconsDir, { recursive: true });
            writeFileSync(join(iconsDir, 'home.svg'), 'HOME');
            writeFileSync(join(iconsDir, 'user.svg'), 'USER');

            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['assets/images', 'public/images']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert
            assert.ok(existsSync(join(outputDir, 'public/images/icons/home.svg')));
            assert.ok(existsSync(join(outputDir, 'public/images/icons/user.svg')));
        });

        it('should skip README.md and .gitkeep files', () => {
            // Setup
            const assetsDir = join(testDir, 'assets');
            mkdirSync(assetsDir);
            writeFileSync(join(assetsDir, 'README.md'), 'README');
            writeFileSync(join(assetsDir, '.gitkeep'), '');
            writeFileSync(join(assetsDir, 'logo.svg'), 'LOGO');

            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['assets', 'public']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert
            assert.ok(!existsSync(join(outputDir, 'public/README.md')));
            assert.ok(!existsSync(join(outputDir, 'public/.gitkeep')));
            assert.ok(existsSync(join(outputDir, 'public/logo.svg')));
        });
    });

    describe('Multiple Assets', () => {
        it('should copy multiple asset mappings', () => {
            // Setup
            const assetsDir = join(testDir, 'assets');
            mkdirSync(assetsDir);
            writeFileSync(join(assetsDir, 'logo.svg'), 'LOGO');

            const fontsDir = join(testDir, 'fonts');
            mkdirSync(fontsDir);
            writeFileSync(join(fontsDir, 'main.woff2'), 'FONT');

            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['assets/logo.svg', 'public/logo.svg'],
                    ['fonts', 'public/fonts']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert
            assert.ok(existsSync(join(outputDir, 'public/logo.svg')));
            assert.ok(existsSync(join(outputDir, 'public/fonts/main.woff2')));
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty assets array', () => {
            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: []
            };

            // Should not throw
            copyAssets(testDir, targetConfig);
        });

        it('should handle missing assets property', () => {
            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir
            };

            // Should not throw
            copyAssets(testDir, targetConfig);
        });

        it('should warn about missing source files', () => {
            const outputDir = join(testDir, 'output');
            mkdirSync(outputDir);

            const targetConfig = {
                output: outputDir,
                assets: [
                    ['nonexistent/file.png', 'public/file.png']
                ]
            };

            // Should not throw, just warn
            copyAssets(testDir, targetConfig);

            // File should not be created
            assert.ok(!existsSync(join(outputDir, 'public/file.png')));
        });
    });

    describe('File Overwriting', () => {
        it('should overwrite existing files', () => {
            // Setup
            const assetsDir = join(testDir, 'assets');
            mkdirSync(assetsDir);
            writeFileSync(join(assetsDir, 'config.json'), '{"version": 2}');

            const outputDir = join(testDir, 'output/public');
            mkdirSync(outputDir, { recursive: true });
            writeFileSync(join(outputDir, 'config.json'), '{"version": 1}');

            const targetConfig = {
                output: join(testDir, 'output'),
                assets: [
                    ['assets/config.json', 'public/config.json']
                ]
            };

            // Execute
            copyAssets(testDir, targetConfig);

            // Assert - file should be overwritten
            const content = readFileSync(join(outputDir, 'config.json'), 'utf8');
            assert.equal(content, '{"version": 2}');
        });
    });
});

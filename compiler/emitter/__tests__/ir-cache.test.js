/**
 * Tests for IR Cache
 * Verifies IR caching and diff detection for selective regeneration
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { IRCache } from '../ir-cache.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('IRCache', () => {
    const testCacheDir = path.join(__dirname, '.test-ir-cache');

    beforeEach(() => {
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    describe('constructor', () => {
        it('should initialize with custom cache directory', () => {
            const cache = new IRCache(testCacheDir);
            assert.strictEqual(cache.cacheDir, testCacheDir);
            assert.strictEqual(cache.cachePath, `${testCacheDir}/ir.json`);
        });

        it('should initialize with default cache directory', () => {
            const cache = new IRCache();
            assert.strictEqual(cache.cacheDir, '.compose/cache');
        });
    });

    describe('saveIR and loadIR', () => {
        it('should save and load IR', () => {
            const cache = new IRCache(testCacheDir);
            const ir = {
                models: [{ name: 'User', fields: [{ name: 'id', type: 'number' }] }],
                features: [{ name: 'Auth', bullets: ['Login', 'Logout'] }],
                guides: []
            };

            cache.saveIR(ir);

            const loaded = cache.loadIR();
            assert.deepStrictEqual(loaded, ir);
        });

        it('should return null if cache does not exist', () => {
            const cache = new IRCache(testCacheDir);
            const loaded = cache.loadIR();
            assert.strictEqual(loaded, null);
        });

        it('should create cache directory if needed', () => {
            const cache = new IRCache(testCacheDir);
            const ir = { models: [], features: [], guides: [] };

            cache.saveIR(ir);

            assert.ok(fs.existsSync(testCacheDir));
            assert.ok(fs.existsSync(cache.cachePath));
        });
    });

    describe('calculateIRHash', () => {
        it('should calculate consistent hash for same IR', () => {
            const cache = new IRCache(testCacheDir);
            const ir = { models: [{ name: 'User' }], features: [], guides: [] };

            const hash1 = cache.calculateIRHash(ir);
            const hash2 = cache.calculateIRHash(ir);

            assert.strictEqual(hash1, hash2);
        });

        it('should calculate different hash for different IR', () => {
            const cache = new IRCache(testCacheDir);
            const ir1 = { models: [{ name: 'User' }], features: [], guides: [] };
            const ir2 = { models: [{ name: 'Product' }], features: [], guides: [] };

            const hash1 = cache.calculateIRHash(ir1);
            const hash2 = cache.calculateIRHash(ir2);

            assert.notStrictEqual(hash1, hash2);
        });
    });

    describe('diff - models', () => {
        it('should detect added models', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = { models: [], features: [], guides: [] };
            const newIR = {
                models: [{ name: 'User', fields: [] }],
                features: [],
                guides: []
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.models.added.length, 1);
            assert.strictEqual(diff.models.added[0], 'User');
            assert.strictEqual(diff.models.modified.length, 0);
            assert.strictEqual(diff.models.removed.length, 0);
            assert.strictEqual(diff.hasChanges, true);
        });

        it('should detect removed models', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [{ name: 'User', fields: [] }],
                features: [],
                guides: []
            };
            const newIR = { models: [], features: [], guides: [] };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.models.removed.length, 1);
            assert.strictEqual(diff.models.removed[0], 'User');
            assert.strictEqual(diff.hasChanges, true);
        });

        it('should detect modified models - field added', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [{ name: 'User', fields: [{ name: 'id', type: 'number' }] }],
                features: [],
                guides: []
            };
            const newIR = {
                models: [{
                    name: 'User', fields: [
                        { name: 'id', type: 'number' },
                        { name: 'email', type: 'text' }
                    ]
                }],
                features: [],
                guides: []
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.models.modified.length, 1);
            assert.strictEqual(diff.models.modified[0], 'User');
            assert.strictEqual(diff.hasChanges, true);
        });

        it('should detect modified models - field type changed', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [{ name: 'User', fields: [{ name: 'id', type: 'number' }] }],
                features: [],
                guides: []
            };
            const newIR = {
                models: [{ name: 'User', fields: [{ name: 'id', type: 'text' }] }],
                features: [],
                guides: []
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.models.modified.length, 1);
            assert.strictEqual(diff.models.modified[0], 'User');
        });

        it('should detect no changes when models are identical', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [{ name: 'User', fields: [{ name: 'id', type: 'number' }] }],
                features: [],
                guides: []
            };
            const newIR = {
                models: [{ name: 'User', fields: [{ name: 'id', type: 'number' }] }],
                features: [],
                guides: []
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.models.hasChanges, false);
            assert.strictEqual(diff.hasChanges, false);
        });
    });

    describe('diff - features', () => {
        it('should detect added features', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = { models: [], features: [], guides: [] };
            const newIR = {
                models: [],
                features: [{ name: 'Auth', bullets: ['Login'] }],
                guides: []
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.features.added.length, 1);
            assert.strictEqual(diff.features.added[0], 'Auth');
            assert.strictEqual(diff.hasChanges, true);
        });

        it('should detect modified features - bullets changed', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [],
                features: [{ name: 'Auth', bullets: ['Login'] }],
                guides: []
            };
            const newIR = {
                models: [],
                features: [{ name: 'Auth', bullets: ['Login', 'Logout'] }],
                guides: []
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.features.modified.length, 1);
            assert.strictEqual(diff.features.modified[0], 'Auth');
        });

        it('should detect removed features', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [],
                features: [{ name: 'Auth', bullets: [] }],
                guides: []
            };
            const newIR = { models: [], features: [], guides: [] };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.features.removed.length, 1);
            assert.strictEqual(diff.features.removed[0], 'Auth');
        });
    });

    describe('diff - guides', () => {
        it('should detect added guides', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = { models: [], features: [], guides: [] };
            const newIR = {
                models: [],
                features: [],
                guides: [{ name: 'App Name', bullets: ['Name it MyApp'] }]
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.guides.added.length, 1);
            assert.strictEqual(diff.guides.added[0], 'App Name');
            assert.strictEqual(diff.hasChanges, true);
        });

        it('should detect modified guides', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [],
                features: [],
                guides: [{ name: 'App Name', bullets: ['Name it MyApp'] }]
            };
            const newIR = {
                models: [],
                features: [],
                guides: [{ name: 'App Name', bullets: ['Name it YourApp'] }]
            };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.guides.modified.length, 1);
            assert.strictEqual(diff.guides.modified[0], 'App Name');
        });

        it('should detect removed guides', () => {
            const cache = new IRCache(testCacheDir);
            const oldIR = {
                models: [],
                features: [],
                guides: [{ name: 'App Name', bullets: [] }]
            };
            const newIR = { models: [], features: [], guides: [] };

            const diff = cache.diff(oldIR, newIR);

            assert.strictEqual(diff.guides.removed.length, 1);
            assert.strictEqual(diff.guides.removed[0], 'App Name');
        });
    });

    describe('diff - initial build', () => {
        it('should mark everything as added for initial build', () => {
            const cache = new IRCache(testCacheDir);
            const newIR = {
                models: [{ name: 'User', fields: [] }],
                features: [{ name: 'Auth', bullets: [] }],
                guides: [{ name: 'Style', bullets: [] }]
            };

            const diff = cache.diff(null, newIR);

            assert.strictEqual(diff.isInitialBuild, true);
            assert.strictEqual(diff.hasChanges, true);
            assert.strictEqual(diff.models.added.length, 1);
            assert.strictEqual(diff.features.added.length, 1);
            assert.strictEqual(diff.guides.added.length, 1);
            assert.strictEqual(diff.models.modified.length, 0);
            assert.strictEqual(diff.models.removed.length, 0);
        });
    });

    describe('clear', () => {
        it('should clear cached IR', () => {
            const cache = new IRCache(testCacheDir);
            const ir = { models: [], features: [], guides: [] };

            cache.saveIR(ir);
            assert.ok(cache.loadIR());

            cache.clear();
            const loaded = cache.loadIR();
            // Cleared cache should return empty object or null
            assert.ok(!loaded || Object.keys(loaded).length === 0);
        });
    });
});

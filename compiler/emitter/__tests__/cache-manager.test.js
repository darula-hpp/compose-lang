import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs';
import path from 'path';
import { CacheManager } from '../cache-manager.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CacheManager', () => {
    const testCacheDir = path.join(__dirname, '.test-cache');

    beforeEach(() => {
        // Clean up test cache directory before each test
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        // Clean up test cache directory after each test
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    it('should generate consistent keys', () => {
        const manager = new CacheManager(testCacheDir);
        const prompt = 'test prompt';
        const options = { model: 'gpt-4', temperature: 0.7 };

        const key1 = manager.generateKey(prompt, options);
        const key2 = manager.generateKey(prompt, options);
        const key3 = manager.generateKey(prompt, { ...options, temperature: 0.8 });

        assert.strictEqual(key1, key2);
        assert.notStrictEqual(key1, key3);
    });

    it('should store and retrieve values', () => {
        const manager = new CacheManager(testCacheDir);
        const key = 'test-key';
        const value = 'test-response';

        assert.strictEqual(manager.get(key), null);

        manager.set(key, value);
        assert.strictEqual(manager.get(key), value);
    });

    it('should persist cache to disk', () => {
        const manager1 = new CacheManager(testCacheDir);
        const key = 'test-key';
        const value = 'test-response';

        manager1.set(key, value);

        // Create new instance pointing to same directory
        const manager2 = new CacheManager(testCacheDir);
        assert.strictEqual(manager2.get(key), value);
    });

    it('should clear cache', () => {
        const manager = new CacheManager(testCacheDir);
        const key = 'test-key';
        const value = 'test-response';

        manager.set(key, value);
        assert.strictEqual(manager.get(key), value);

        manager.clear();
        assert.strictEqual(manager.get(key), null);

        // Verify file is updated
        const manager2 = new CacheManager(testCacheDir);
        assert.strictEqual(manager2.get(key), null);
    });

    it('should handle missing cache directory gracefully', () => {
        const manager = new CacheManager(testCacheDir);
        assert.strictEqual(manager.get('non-existent'), null);
    });
});

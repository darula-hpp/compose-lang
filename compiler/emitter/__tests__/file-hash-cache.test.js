/**
 * Tests for File Hash Cache
 * Verifies hash calculation, change detection, and cache persistence
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs';
import path from 'path';
import { FileHashCache, createFileHashCache } from '../file-hash-cache.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FileHashCache', () => {
    const testCacheDir = path.join(__dirname, '.test-cache');
    let cache;

    beforeEach(() => {
        // Clean up test cache directory
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
        cache = new FileHashCache(testCacheDir);
    });

    afterEach(() => {
        // Clean up after each test
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    describe('constructor', () => {
        it('should create instance with custom cache directory', () => {
            assert.ok(cache instanceof FileHashCache);
            assert.strictEqual(cache.cacheDir, testCacheDir);
            assert.strictEqual(cache.cacheFile, `${testCacheDir}/file-hashes.json`);
        });

        it('should create instance with default cache directory', () => {
            const defaultCache = new FileHashCache();
            assert.strictEqual(defaultCache.cacheDir, '.compose/cache');
            assert.strictEqual(defaultCache.cacheFile, '.compose/cache/file-hashes.json');
        });

        it('should initialize with empty hashes when no cache file exists', () => {
            assert.deepStrictEqual(cache.hashes, {});
        });

        it('should load existing cache file on initialization', () => {
            // Create cache directory and file
            fs.mkdirSync(testCacheDir, { recursive: true });
            const testData = {
                'file1.js': { hash: 'abc123', lastModified: 123456 }
            };
            fs.writeFileSync(
                `${testCacheDir}/file-hashes.json`,
                JSON.stringify(testData),
                'utf8'
            );

            // Create new instance - should load existing cache
            const newCache = new FileHashCache(testCacheDir);
            assert.deepStrictEqual(newCache.hashes, testData);
        });
    });

    describe('calculateHash', () => {
        it('should calculate SHA256 hash of content', () => {
            const content = 'console.log("Hello, World!");';
            const hash = cache.calculateHash(content);

            assert.ok(hash);
            assert.strictEqual(typeof hash, 'string');
            assert.strictEqual(hash.length, 64); // SHA256 produces 64 hex characters
        });

        it('should produce same hash for same content', () => {
            const content = 'const x = 42;';
            const hash1 = cache.calculateHash(content);
            const hash2 = cache.calculateHash(content);

            assert.strictEqual(hash1, hash2);
        });

        it('should produce different hash for different content', () => {
            const content1 = 'const x = 42;';
            const content2 = 'const y = 100;';
            const hash1 = cache.calculateHash(content1);
            const hash2 = cache.calculateHash(content2);

            assert.notStrictEqual(hash1, hash2);
        });

        it('should handle empty string', () => {
            const hash = cache.calculateHash('');
            assert.ok(hash);
            assert.strictEqual(hash.length, 64);
        });

        it('should handle unicode content', () => {
            const content = '你好世界 🌍';
            const hash = cache.calculateHash(content);
            assert.ok(hash);
            assert.strictEqual(hash.length, 64);
        });
    });

    describe('hasChanged', () => {
        it('should return true for new file', () => {
            const content = 'console.log("test");';
            assert.strictEqual(cache.hasChanged('new-file.js', content), true);
        });

        it('should return false for unchanged file', () => {
            const filePath = 'test-file.js';
            const content = 'const x = 42;';

            // Add file to cache
            cache.updateHash(filePath, content);

            // Check if changed (should be false)
            assert.strictEqual(cache.hasChanged(filePath, content), false);
        });

        it('should return true for changed file', () => {
            const filePath = 'test-file.js';
            const originalContent = 'const x = 42;';
            const newContent = 'const x = 100;';

            // Add file to cache with original content
            cache.updateHash(filePath, originalContent);

            // Check with new content (should be true)
            assert.strictEqual(cache.hasChanged(filePath, newContent), true);
        });

        it('should handle whitespace changes', () => {
            const filePath = 'test-file.js';
            const content1 = 'const x=42;';
            const content2 = 'const x = 42;';

            cache.updateHash(filePath, content1);

            // Even whitespace changes should be detected
            assert.strictEqual(cache.hasChanged(filePath, content2), true);
        });
    });

    describe('updateHash', () => {
        it('should update hash for a file', () => {
            const filePath = 'test-file.js';
            const content = 'const x = 42;';

            cache.updateHash(filePath, content);

            assert.ok(cache.hashes[filePath]);
            assert.strictEqual(cache.hashes[filePath].hash, cache.calculateHash(content));
            assert.ok(cache.hashes[filePath].lastModified);
            assert.strictEqual(typeof cache.hashes[filePath].lastModified, 'number');
        });

        it('should overwrite existing hash', () => {
            const filePath = 'test-file.js';
            const content1 = 'const x = 42;';
            const content2 = 'const x = 100;';

            cache.updateHash(filePath, content1);
            const firstHash = cache.hashes[filePath].hash;
            const firstTimestamp = cache.hashes[filePath].lastModified;

            cache.updateHash(filePath, content2);
            const secondHash = cache.hashes[filePath].hash;
            const secondTimestamp = cache.hashes[filePath].lastModified;

            assert.notStrictEqual(secondHash, firstHash);
            assert.ok(secondTimestamp >= firstTimestamp);
        });

        it('should handle multiple files', () => {
            cache.updateHash('file1.js', 'content 1');
            cache.updateHash('file2.js', 'content 2');
            cache.updateHash('file3.js', 'content 3');

            assert.strictEqual(Object.keys(cache.hashes).length, 3);
            assert.ok(cache.hashes['file1.js']);
            assert.ok(cache.hashes['file2.js']);
            assert.ok(cache.hashes['file3.js']);
        });
    });

    describe('removeHash', () => {
        it('should remove hash entry for a file', () => {
            const filePath = 'test-file.js';
            cache.updateHash(filePath, 'content');

            assert.ok(cache.hashes[filePath]);

            cache.removeHash(filePath);

            assert.strictEqual(cache.hashes[filePath], undefined);
        });

        it('should handle removing non-existent file', () => {
            // Should not throw error
            assert.doesNotThrow(() => {
                cache.removeHash('non-existent.js');
            });
        });

        it('should only remove specified file', () => {
            cache.updateHash('file1.js', 'content 1');
            cache.updateHash('file2.js', 'content 2');

            cache.removeHash('file1.js');

            assert.strictEqual(cache.hashes['file1.js'], undefined);
            assert.ok(cache.hashes['file2.js']);
        });
    });

    describe('loadCache', () => {
        it('should return empty object when cache file does not exist', () => {
            const result = cache.loadCache();
            assert.deepStrictEqual(result, {});
        });

        it('should load valid JSON cache file', () => {
            const testData = {
                'file1.js': { hash: 'abc123', lastModified: 123456 },
                'file2.js': { hash: 'def456', lastModified: 789012 }
            };

            fs.mkdirSync(testCacheDir, { recursive: true });
            fs.writeFileSync(cache.cacheFile, JSON.stringify(testData), 'utf8');

            const result = cache.loadCache();
            assert.deepStrictEqual(result, testData);
        });

        it('should return empty object for corrupted cache file', () => {
            fs.mkdirSync(testCacheDir, { recursive: true });
            fs.writeFileSync(cache.cacheFile, 'invalid json{]', 'utf8');

            const result = cache.loadCache();
            assert.deepStrictEqual(result, {});
        });
    });

    describe('saveCache', () => {
        it('should save cache to disk', () => {
            cache.updateHash('file1.js', 'content 1');
            cache.updateHash('file2.js', 'content 2');

            cache.saveCache();

            assert.ok(fs.existsSync(cache.cacheFile));

            const savedData = JSON.parse(fs.readFileSync(cache.cacheFile, 'utf8'));
            assert.deepStrictEqual(savedData, cache.hashes);
        });

        it('should create cache directory if it does not exist', () => {
            assert.strictEqual(fs.existsSync(testCacheDir), false);

            cache.updateHash('file.js', 'content');
            cache.saveCache();

            assert.ok(fs.existsSync(testCacheDir));
            assert.ok(fs.existsSync(cache.cacheFile));
        });

        it('should format JSON with indentation', () => {
            cache.updateHash('file.js', 'content');
            cache.saveCache();

            const rawContent = fs.readFileSync(cache.cacheFile, 'utf8');
            // Check if it's formatted (contains newlines and spaces)
            assert.ok(rawContent.includes('\n'));
            assert.ok(rawContent.includes('  ')); // 2-space indentation
        });

        it('should handle write errors gracefully', () => {
            // Create cache with invalid path
            const invalidCache = new FileHashCache('/dev/null/invalid');
            invalidCache.updateHash('file.js', 'content');

            // Should not throw
            assert.doesNotThrow(() => {
                invalidCache.saveCache();
            });
        });
    });

    describe('clear', () => {
        it('should clear all hashes', () => {
            cache.updateHash('file1.js', 'content 1');
            cache.updateHash('file2.js', 'content 2');

            assert.strictEqual(Object.keys(cache.hashes).length, 2);

            cache.clear();

            assert.deepStrictEqual(cache.hashes, {});
        });

        it('should save empty cache to disk', () => {
            cache.updateHash('file.js', 'content');
            cache.saveCache();

            cache.clear();

            assert.ok(fs.existsSync(cache.cacheFile));
            const savedData = JSON.parse(fs.readFileSync(cache.cacheFile, 'utf8'));
            assert.deepStrictEqual(savedData, {});
        });
    });

    describe('getStats', () => {
        it('should return stats for empty cache', () => {
            const stats = cache.getStats();

            assert.strictEqual(stats.totalFiles, 0);
            assert.strictEqual(stats.cacheFile, cache.cacheFile);
            assert.ok(stats.cacheSize > 0); // Empty object "{}" has size
        });

        it('should return correct file count', () => {
            cache.updateHash('file1.js', 'content 1');
            cache.updateHash('file2.js', 'content 2');
            cache.updateHash('file3.js', 'content 3');

            const stats = cache.getStats();

            assert.strictEqual(stats.totalFiles, 3);
        });

        it('should return cache file path', () => {
            const stats = cache.getStats();
            assert.strictEqual(stats.cacheFile, `${testCacheDir}/file-hashes.json`);
        });

        it('should return cache size', () => {
            cache.updateHash('file.js', 'content');
            const stats = cache.getStats();

            assert.ok(stats.cacheSize > 0);
            assert.strictEqual(typeof stats.cacheSize, 'number');
        });
    });

    describe('getHash', () => {
        it('should return hash for existing file', () => {
            const filePath = 'test-file.js';
            const content = 'const x = 42;';
            const expectedHash = cache.calculateHash(content);

            cache.updateHash(filePath, content);

            assert.strictEqual(cache.getHash(filePath), expectedHash);
        });

        it('should return null for non-existent file', () => {
            assert.strictEqual(cache.getHash('non-existent.js'), null);
        });
    });

    describe('has', () => {
        it('should return true for existing file', () => {
            cache.updateHash('test-file.js', 'content');
            assert.strictEqual(cache.has('test-file.js'), true);
        });

        it('should return false for non-existent file', () => {
            assert.strictEqual(cache.has('non-existent.js'), false);
        });

        it('should return false after file is removed', () => {
            cache.updateHash('test-file.js', 'content');
            assert.strictEqual(cache.has('test-file.js'), true);

            cache.removeHash('test-file.js');
            assert.strictEqual(cache.has('test-file.js'), false);
        });
    });

    describe('persistence', () => {
        it('should persist cache across instances', () => {
            const filePath = 'test-file.js';
            const content = 'const x = 42;';

            // First instance: add file
            cache.updateHash(filePath, content);
            cache.saveCache();

            // Second instance: load from disk
            const newCache = new FileHashCache(testCacheDir);

            assert.strictEqual(newCache.has(filePath), true);
            assert.strictEqual(newCache.getHash(filePath), cache.getHash(filePath));
            assert.strictEqual(newCache.hasChanged(filePath, content), false);
        });

        it('should detect changes across instances', () => {
            const filePath = 'test-file.js';
            const originalContent = 'const x = 42;';
            const newContent = 'const x = 100;';

            // First instance: save original
            cache.updateHash(filePath, originalContent);
            cache.saveCache();

            // Second instance: check for changes
            const newCache = new FileHashCache(testCacheDir);

            assert.strictEqual(newCache.hasChanged(filePath, newContent), true);
            assert.strictEqual(newCache.hasChanged(filePath, originalContent), false);
        });
    });
});

describe('createFileHashCache factory function', () => {
    const testCacheDir = path.join(__dirname, '.test-factory-cache');

    afterEach(() => {
        if (fs.existsSync(testCacheDir)) {
            fs.rmSync(testCacheDir, { recursive: true, force: true });
        }
    });

    it('should create FileHashCache instance', () => {
        const cache = createFileHashCache(testCacheDir);
        assert.ok(cache instanceof FileHashCache);
        assert.strictEqual(cache.cacheDir, testCacheDir);
    });

    it('should work with default cache directory', () => {
        const cache = createFileHashCache();
        assert.ok(cache instanceof FileHashCache);
    });
});

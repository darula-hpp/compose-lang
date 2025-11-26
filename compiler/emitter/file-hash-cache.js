/**
 * File Hash Cache
 * Tracks file content hashes to skip writing unchanged files
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

export class FileHashCache {
    /**
     * @param {string} cacheDir - Directory to store hash cache
     */
    constructor(cacheDir = '.compose/cache') {
        this.cacheDir = cacheDir;
        this.cacheFile = `${cacheDir}/file-hashes.json`;
        this.hashes = this.loadCache();
    }

    /**
     * Calculate SHA256 hash of file content
     * @param {string} content - File content
     * @returns {string} - Hash hexadecimal
     */
    calculateHash(content) {
        return createHash('sha256')
            .update(content, 'utf8')
            .digest('hex');
    }

    /**
     * Check if file content has changed since last build
     * @param {string} filePath - Relative file path
     * @param {string} content - Current file content
     * @returns {boolean} - True if changed or new, false if unchanged
     */
    hasChanged(filePath, content) {
        const newHash = this.calculateHash(content);
        const cached = this.hashes[filePath];

        // New file
        if (!cached) {
            return true;
        }

        // Compare hashes
        return cached.hash !== newHash;
    }

    /**
     * Update hash for a file
     * @param {string} filePath - Relative file path
     * @param {string} content - File content
     */
    updateHash(filePath, content) {
        const hash = this.calculateHash(content);
        this.hashes[filePath] = {
            hash,
            lastModified: Date.now()
        };
    }

    /**
     * Remove hash entry for a file (when file is deleted)
     * @param {string} filePath - Relative file path
     */
    removeHash(filePath) {
        delete this.hashes[filePath];
    }

    /**
     * Load cache from disk
     * @returns {Object} - Hash cache object
     */
    loadCache() {
        if (!existsSync(this.cacheFile)) {
            return {};
        }

        try {
            const data = readFileSync(this.cacheFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn(`⚠️  Failed to load file hash cache: ${error.message}`);
            return {};
        }
    }

    /**
     * Save cache to disk
     */
    saveCache() {
        try {
            // Ensure cache directory exists
            if (!existsSync(this.cacheDir)) {
                mkdirSync(this.cacheDir, { recursive: true });
            }

            writeFileSync(
                this.cacheFile,
                JSON.stringify(this.hashes, null, 2),
                'utf8'
            );
        } catch (error) {
            console.warn(`⚠️  Failed to save file hash cache: ${error.message}`);
        }
    }

    /**
     * Clear all hashes and save
     */
    clear() {
        this.hashes = {};
        this.saveCache();
    }

    /**
     * Get cache statistics
     * @returns {Object} - Stats object
     */
    getStats() {
        return {
            totalFiles: Object.keys(this.hashes).length,
            cacheFile: this.cacheFile,
            cacheSize: JSON.stringify(this.hashes).length
        };
    }

    /**
     * Get hash for a specific file
     * @param {string} filePath - Relative file path
     * @returns {string|null} - Hash or null if not found
     */
    getHash(filePath) {
        const cached = this.hashes[filePath];
        return cached ? cached.hash : null;
    }

    /**
     * Check if a file exists in cache
     * @param {string} filePath - Relative file path
     * @returns {boolean} - True if file is in cache
     */
    has(filePath) {
        return filePath in this.hashes;
    }
}

/**
 * Create a file hash cache instance
 * @param {string} cacheDir - Directory to store hash cache
 * @returns {FileHashCache} - FileHashCache instance
 */
export function createFileHashCache(cacheDir) {
    return new FileHashCache(cacheDir);
}

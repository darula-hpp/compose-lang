/**
 * LLM Response Cache Manager
 * Provides deterministic builds by caching LLM responses
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class CacheManager {
    /**
     * @param {string} cacheDir - Directory to store cache files
     */
    constructor(cacheDir = '.compose/cache') {
        this.cacheDir = cacheDir;
        this.cacheFile = `${cacheDir}/llm-responses.json`;
        this.cache = this.loadCache();
    }

    /**
     * Load cache from disk
     */
    loadCache() {
        if (!existsSync(this.cacheFile)) {
            return {};
        }

        try {
            const data = readFileSync(this.cacheFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn(`Failed to load cache: ${error.message}`);
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

            writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
        } catch (error) {
            console.warn(`Failed to save cache: ${error.message}`);
        }
    }

    /**
     * Generate a hash key for a prompt
     * @param {string} prompt - The LLM prompt
     * @param {object} options - LLM options (model, temperature, etc.)
     * @returns {string} - SHA256 hash
     */
    generateKey(prompt, options = {}) {
        // Include key options that affect output
        const keyData = {
            prompt,
            model: options.model,
            temperature: options.temperature,
            // Don't include maxTokens as it shouldn't change the content semantically
        };

        const hash = createHash('sha256');
        hash.update(JSON.stringify(keyData));
        return hash.digest('hex');
    }

    /**
     * Get cached response
     * @param {string} key - Cache key
     * @returns {string|null} - Cached response or null if not found
     */
    get(key) {
        return this.cache[key] || null;
    }

    /**
     * Store response in cache
     * @param {string} key - Cache key
     * @param {string} response - LLM response
     */
    set(key, response) {
        this.cache[key] = response;
        this.saveCache();
    }

    /**
     * Clear entire cache
     */
    clear() {
        this.cache = {};
        this.saveCache();
    }

    /**
     * Get cache statistics
     * @returns {object} - Stats about cache usage
     */
    getStats() {
        return {
            entries: Object.keys(this.cache).length,
            sizeBytes: JSON.stringify(this.cache).length,
        };
    }
}

/**
 * Create a cache manager instance
 */
export function createCacheManager(cacheDir) {
    return new CacheManager(cacheDir);
}

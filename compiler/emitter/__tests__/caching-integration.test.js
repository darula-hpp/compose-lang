import fs from 'fs';
import path from 'path';
import { CacheManager } from '../cache-manager.js';

// Mock client that implements caching logic similar to real clients
class TestLLMClient {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.callCount = 0;
        this.model = 'test-model';
        this.temperature = 0.7;
    }

    async generate(systemPrompt, userPrompt, options = {}) {
        // Check cache first (logic copied from OpenAIClient)
        if (this.cacheManager) {
            const cacheKey = this.cacheManager.generateKey({ systemPrompt, userPrompt }, {
                model: this.model,
                temperature: this.temperature,
                ...options
            });

            const cached = this.cacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        // Simulate API call
        this.callCount++;
        const response = `Generated response for: ${userPrompt}`;

        // Store in cache
        if (this.cacheManager) {
            const cacheKey = this.cacheManager.generateKey({ systemPrompt, userPrompt }, {
                model: this.model,
                temperature: this.temperature,
                ...options
            });
            this.cacheManager.set(cacheKey, response);
        }

        return response;
    }
}

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Caching Integration', () => {
    const testCacheDir = path.join(__dirname, '.test-cache-integration');

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

    test('should cache LLM responses', async () => {
        const cacheManager = new CacheManager(testCacheDir);
        const client = new TestLLMClient(cacheManager);

        const systemPrompt = 'sys';
        const userPrompt = 'user';

        // First call - should hit "API"
        const result1 = await client.generate(systemPrompt, userPrompt);
        expect(client.callCount).toBe(1);
        expect(result1).toBe('Generated response for: user');

        // Second call - should hit cache
        const result2 = await client.generate(systemPrompt, userPrompt);
        expect(client.callCount).toBe(1); // Count should not increase
        expect(result2).toBe(result1);
    });

    test('should miss cache with different prompts', async () => {
        const cacheManager = new CacheManager(testCacheDir);
        const client = new TestLLMClient(cacheManager);

        await client.generate('sys', 'prompt 1');
        expect(client.callCount).toBe(1);

        await client.generate('sys', 'prompt 2');
        expect(client.callCount).toBe(2);
    });

    test('should miss cache with different options', async () => {
        const cacheManager = new CacheManager(testCacheDir);
        const client = new TestLLMClient(cacheManager);

        await client.generate('sys', 'prompt', { temperature: 0.5 });
        expect(client.callCount).toBe(1);

        // Different temperature should generate different key
        await client.generate('sys', 'prompt', { temperature: 0.8 });
        expect(client.callCount).toBe(2);
    });

    test('should re-fetch after cache clear', async () => {
        const cacheManager = new CacheManager(testCacheDir);
        const client = new TestLLMClient(cacheManager);

        await client.generate('sys', 'prompt');
        expect(client.callCount).toBe(1);

        cacheManager.clear();

        await client.generate('sys', 'prompt');
        expect(client.callCount).toBe(2);
    });
});

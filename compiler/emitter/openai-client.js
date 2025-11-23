/**
 * OpenAI LLM Client
 * Real implementation using OpenAI API
 */

import OpenAI from 'openai';

export class OpenAIClient {
    constructor(config, cacheManager = null) {
        this.config = config;
        this.apiKey = this.resolveApiKey(config.apiKey);
        this.model = config.model || 'gpt-4';
        this.temperature = config.temperature ?? 0.7;
        this.maxTokens = config.maxTokens || 2048;
        this.cacheManager = cacheManager;

        if (!this.apiKey) {
            throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
        }

        this.client = new OpenAI({
            apiKey: this.apiKey
        });
    }

    /**
     * Resolve API key from environment variables
     */
    resolveApiKey(keyTemplate) {
        if (!keyTemplate) return null;

        if (keyTemplate.startsWith('${') && keyTemplate.endsWith('}')) {
            const envVar = keyTemplate.slice(2, -1);
            return process.env[envVar];
        }
        return keyTemplate;
    }

    /**
     * Generate code from prompt
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @param {object} options - Generation options
     * @returns {Promise<string>} - Generated code
     */
    async generate(systemPrompt, userPrompt, options = {}) {
        // Check cache first
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

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
                ...options
            });

            const text = response.choices[0].message.content;

            // Clean up the response
            const cleanedCode = this.stripMarkdown(text);

            // Store in cache
            if (this.cacheManager) {
                const cacheKey = this.cacheManager.generateKey({ systemPrompt, userPrompt }, {
                    model: this.model,
                    temperature: this.temperature,
                    ...options
                });
                this.cacheManager.set(cacheKey, cleanedCode);
            }

            return cleanedCode;
        } catch (error) {
            if (error.status === 429) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            } else if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your configuration.');
            } else {
                throw new Error(`OpenAI API error: ${error.message}`);
            }
        }
    }

    /**
     * Strip markdown code fences from LLM output
     */
    stripMarkdown(text) {
        // Remove ```language and ``` fences
        return text
            .replace(/^```[\w]*\n/gm, '')
            .replace(/\n```$/gm, '')
            .replace(/^```\n/gm, '')
            .replace(/\n```\n/gm, '\n')
            .trim();
    }

    /**
     * Get model name
     */
    getModel() {
        return this.model;
    }
}

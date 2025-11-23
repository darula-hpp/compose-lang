/**
 * OpenAI LLM Client
 * Real implementation using OpenAI API
 */

import OpenAI from 'openai';

export class OpenAIClient {
    constructor(config) {
        this.model = config.model || 'gpt-4';
        this.apiKey = this.resolveApiKey(config.apiKey);
        this.temperature = config.temperature || 0.2;
        this.maxTokens = config.maxTokens || 2048;

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

            // Strip markdown code fences if present
            return this.stripMarkdown(text);
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

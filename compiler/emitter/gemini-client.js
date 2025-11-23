/**
 * Google Gemini LLM Client
 * Real implementation using Google Generative AI API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
    constructor(config) {
        this.model = config.model || 'gemini-pro';
        this.apiKey = this.resolveApiKey(config.apiKey);
        this.temperature = config.temperature || 0.2;
        this.maxTokens = config.maxTokens || 2048;

        if (!this.apiKey) {
            throw new Error('Gemini API key is required. Set GEMINI_API_KEY environment variable.');
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.generativeModel = this.genAI.getGenerativeModel({
            model: this.model,
            generationConfig: {
                temperature: this.temperature,
                maxOutputTokens: this.maxTokens,
            }
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
            // Gemini uses a combined prompt
            const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

            const result = await this.generativeModel.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            if (error.message?.includes('API_KEY')) {
                throw new Error('Invalid Gemini API key. Please check your configuration.');
            } else if (error.message?.includes('quota')) {
                throw new Error('Gemini API quota exceeded. Please try again later.');
            } else {
                throw new Error(`Gemini API error: ${error.message}`);
            }
        }
    }

    /**
     * Get model name
     */
    getModel() {
        return this.model;
    }
}

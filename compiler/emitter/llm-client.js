/**
 * Mock LLM Client
 * Simulates LLM responses for testing purposes
 * In production, this would be replaced with actual LLM API calls
 */

export class MockLLMClient {
  constructor(cacheManager = null) {
    this.cacheManager = cacheManager;
    this.responses = new Map();
  }

  /**
   * Generate code from prompt
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {object} options - Generation options
   * @returns {Promise<string>} - Generated code
   */
  async generate(systemPrompt, userPrompt, options = {}) {
    // In a real implementation, this would call an LLM API
    // For now, return mock code based on prompt patterns

    if (userPrompt.includes('component')) {
      return this.generateMockComponent(userPrompt);
    }

    if (userPrompt.includes('page')) {
      return this.generateMockPage(userPrompt);
    }

    if (userPrompt.includes('API endpoint')) {
      return this.generateMockAPI(userPrompt);
    }

    if (userPrompt.includes('function')) {
      return this.generateMockFunction(userPrompt);
    }

    if (userPrompt.includes('data structure')) {
      return this.generateMockStructure(userPrompt);
    }

    return '// Mock generated code\n';
  }

  generateMockComponent(prompt) {
    // Extract component name from prompt
    const nameMatch = prompt.match(/Component Name: (\w+)/);
    const name = nameMatch ? nameMatch[1] : 'Component';

    return `import React from 'react';

export function ${name}(props) {
  return (
    <div className="${name.toLowerCase()}">
      <h2>${name}</h2>
      {/* Component implementation */}
    </div>
  );
}

export default ${name};`;
  }

  generateMockPage(prompt) {
    const nameMatch = prompt.match(/Page Name: (\w+)/);
    const name = nameMatch ? nameMatch[1] : 'Page';
    const isProtected = prompt.includes('Protected: Yes');

    return `import React from 'react';
${isProtected ? "import { Navigate } from 'react-router-dom';" : ''}

export function ${name}() {
${isProtected ? `  const isAuthenticated = false; // Check authentication
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
` : ''}  return (
    <div className="${name.toLowerCase()}-page">
      <h1>${name}</h1>
      {/* Page content */}
    </div>
  );
}

export default ${name};`;
  }

  generateMockAPI(prompt) {
    const nameMatch = prompt.match(/API Name: (\w+)/);
    const name = nameMatch ? nameMatch[1] : 'handler';

    return `import express from 'express';

export async function ${name}(req, res) {
  try {
    // API implementation
    const result = {}; // Fetch data
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}`;
  }

  generateMockFunction(prompt) {
    const nameMatch = prompt.match(/Function Name: (\w+)/);
    const name = nameMatch ? nameMatch[1] : 'myFunction';

    return `/**
 * ${name}
 * Implementation generated from description
 */
export function ${name}(...args) {
  // Function implementation
  return null;
}`;
  }

  generateMockStructure(prompt) {
    const nameMatch = prompt.match(/Name: (\w+)/);
    const name = nameMatch ? nameMatch[1] : 'MyType';

    return `export interface ${name} {
  // Type definition
  id: number;
  [key: string]: any;
}`;
  }

  /**
   * Set custom response for a specific pattern
   * @param {string} pattern - Pattern to match in prompts
   * @param {string} response - Response to return
   */
  setResponse(pattern, response) {
    this.responses.set(pattern, response);
  }
}

/**
 * LLM Client Factory
 * Creates appropriate LLM client based on configuration
 */

import { createCacheManager } from './cache-manager.js';

/**
 * Create LLM client
 * Create an LLM client based on configuration
 * @param {object} config - LLM configuration from compose.json
 * @returns {MockLLMClient|OpenAIClient|GeminiClient} - LLM client instance
 */
export async function createLLMClient(config = {}) {
  // Create cache manager (shared across all clients)
  const cacheManager = createCacheManager(config.cache);

  // If no config or explicitly mock, return mock client
  if (!config || config.mock || !config.provider) {
    return new MockLLMClient(cacheManager);
  }

  // Create real client based on provider
  try {
    const provider = config.provider.toLowerCase();

    switch (provider) {
      case 'openai': {
        const { OpenAIClient } = await import('./openai-client.js');
        return new OpenAIClient(config, cacheManager);
      }
      case 'gemini': {
        const { GeminiClient } = await import('./gemini-client.js');
        return new GeminiClient(config, cacheManager);
      }
      case 'anthropic': {
        // TODO: Implement Anthropic client
        console.warn('Anthropic not yet implemented, using mock');
        return new MockLLMClient(cacheManager);
      }
      default:
        console.warn(`Unknown provider "${config.provider}", using mock`);
        return new MockLLMClient(cacheManager);
    }
  } catch (error) {
    console.error(`Failed to create ${config.provider} client: ${error.message}`);
    console.warn('Falling back to mock LLM client');
    return new MockLLMClient(cacheManager);
  }
}

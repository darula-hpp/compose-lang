#!/usr/bin/env node

/**
 * Test Gemini API integration
 */

import { GeminiClient } from '../compiler/emitter/gemini-client.js';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not set');
    console.log('\nSet it with:');
    console.log('export GEMINI_API_KEY="your-key-here"');
    process.exit(1);
}

console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

const client = new GeminiClient({
    apiKey,
    model: 'gemini-1.5-pro',
    temperature: 0.2
});

console.log('\n🧪 Testing Gemini 1.5 Pro...\n');

const systemPrompt = 'You are a code generator. Generate clean, production-ready code.';
const userPrompt = `Generate a simple React TodoItem component that accepts a 'todo' prop with {id, title, completed} properties. Include a checkbox and delete button.`;

try {
    const code = await client.generate(systemPrompt, userPrompt);
    console.log('✅ Generation successful!\n');
    console.log('Generated Code:');
    console.log('─'.repeat(50));
    console.log(code);
    console.log('─'.repeat(50));
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

#!/usr/bin/env node

/**
 * List available Gemini models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('Please set GEMINI_API_KEY');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

console.log('📋 Fetching available Gemini models...\n');

try {
    const models = await genAI.listModels();

    console.log('✅ Available models:\n');
    for await (const model of models) {
        console.log(`  - ${model.name}`);
        if (model.displayName) console.log(`    Display: ${model.displayName}`);
        if (model.description) console.log(`    Desc: ${model.description}`);
        console.log();
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}

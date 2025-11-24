/**
 * Emitter module exports
 */

export { loadComposeConfig, validateComposeConfig, getTarget } from './compose-config.js';
export { createLLMClient, MockLLMClient } from './llm-client.js';
export { CodeEmitter, emitCode } from './code-emitter.js';
export { OutputWriter, writeOutput } from './output-writer.js';
export * as PromptTemplates from './prompt-templates.js';

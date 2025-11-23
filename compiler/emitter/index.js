/**
 * Emitter module exports
 */

export { loadTargetConfig, validateTargetConfig, getTarget } from './target-config.js';
export { createLLMClient, MockLLMClient } from './llm-client.js';
export { CodeEmitter, emitCode } from './code-emitter.js';
export { OutputWriter, writeOutput } from './output-writer.js';
export * as PromptTemplates from './prompt-templates.js';

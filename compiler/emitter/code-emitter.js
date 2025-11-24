/**
 * Code Emitter (v0.2.0)
 * Generates code from IR using LLM - simplified for model/feature/guide architecture
 */

import { createLLMClient } from './llm-client.js';
import { createFullProjectPrompt } from './prompt-templates.js';

export class CodeEmitter {
    constructor(target, options = {}) {
        this.target = target;
        this.llmConfig = options.llm || {};
        this.llmClient = null; // Will be initialized in emit()
    }

    /**
     * Emit code from IR
     * @param {object} ir - ComposeIR object (v0.2.0 format)
     * @returns {Promise<object>} - Generated code
     */
    async emit(ir) {
        // Initialize LLM client if not already done
        if (!this.llmClient) {
            this.llmClient = await createLLMClient(this.llmConfig);
        }

        // In v0.2.0, we send the ENTIRE IR to the LLM at once
        // The IR contains models (data), features (behavior), guides (hints)
        // The LLM generates the complete application code

        const prompt = createFullProjectPrompt(ir, this.target);
        const generatedCode = await this.llmClient.generate('', prompt);

        // Parse the output into files
        const files = this.parseOutput(generatedCode);

        return {
            files,
            target: this.target
        };
    }

    /**
     * Parse LLM output into files
     * Format: ### FILE: path/to/file.ext
     */
    parseOutput(output) {
        const files = [];
        const lines = output.split('\n');
        let currentFile = null;
        let currentContent = [];

        for (const line of lines) {
            if (line.startsWith('### FILE: ')) {
                // Save previous file
                if (currentFile) {
                    files.push({
                        path: currentFile.trim(),
                        content: currentContent.join('\n'),
                        type: 'code'
                    });
                }

                // Start new file
                currentFile = line.substring(10).trim();
                currentContent = [];
            } else {
                if (currentFile) {
                    currentContent.push(line);
                }
            }
        }

        // Save last file
        if (currentFile) {
            files.push({
                path: currentFile.trim(),
                content: currentContent.join('\n'),
                type: 'code'
            });
        }

        return files;
    }

    /**
     * Get file extension for target language
     */
    getFileExtension() {
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            rust: 'rs',
            go: 'go'
        };

        return extensions[this.target.language] || 'js';
    }
}

/**
 * Emit code from IR (convenience function)
 * @param {object} ir - ComposeIR object
 * @param {object} target - Target configuration
 * @param {object} options - Emission options
 * @returns {Promise<object>} - Generated code
 */
export async function emitCode(ir, target, options = {}) {
    const emitter = new CodeEmitter(target, options);
    return await emitter.emit(ir);
}

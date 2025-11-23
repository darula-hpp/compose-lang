/**
 * Code Emitter
 * Orchestrates code generation from IR using LLM
 */

import { createLLMClient } from './llm-client.js';
import {
    createSystemPrompt,
    createComponentPrompt,
    createPagePrompt,
    createAPIPrompt,
    createFunctionPrompt,
    createStructurePrompt
} from './prompt-templates.js';

export class CodeEmitter {
    constructor(target, options = {}) {
        this.target = target;
        this.llmConfig = options.llm || {};
        this.llmClient = null; // Will be initialized in emit()
        this.systemPrompt = createSystemPrompt(target);
        this.generatedFiles = [];
    }

    /**
     * Emit code from IR
     * @param {object} ir - ComposeIR object
     * @returns {Promise<object>} - Generated code organized by file
     */
    async emit(ir) {
        // Initialize LLM client if not already done
        if (!this.llmClient) {
            this.llmClient = await createLLMClient(this.llmConfig);
        }

        this.generatedFiles = [];

        // Generate structures
        for (const structure of ir.structures) {
            await this.emitStructure(structure);
        }

        // Generate functions
        for (const func of ir.functions) {
            await this.emitFunction(func);
        }

        // Generate frontend code if this is a frontend target
        if (this.isFrontendTarget()) {
            await this.emitFrontend(ir.frontend);
        }

        // Generate backend code if this is a backend target
        if (this.isBackendTarget()) {
            await this.emitBackend(ir.backend);
        }

        return {
            files: this.generatedFiles,
            target: this.target
        };
    }

    /**
     * Emit structure/type definition
     */
    async emitStructure(structure) {
        const prompt = createStructurePrompt(structure, this.target);
        const code = await this.llmClient.generate(this.systemPrompt, prompt);

        this.addFile({
            path: `types/${structure.name}.${this.getFileExtension()}`,
            content: code,
            type: 'structure'
        });
    }

    /**
     * Emit function implementation
     */
    async emitFunction(func) {
        const prompt = createFunctionPrompt(func, this.target);
        const code = await this.llmClient.generate(this.systemPrompt, prompt);

        this.addFile({
            path: `utils/${func.name}.${this.getFileExtension()}`,
            content: code,
            type: 'function'
        });
    }

    /**
     * Emit frontend code
     */
    async emitFrontend(frontend) {
        // Generate pages
        for (const page of frontend.pages) {
            const prompt = createPagePrompt(page, this.target);
            const code = await this.llmClient.generate(this.systemPrompt, prompt);

            this.addFile({
                path: `pages/${page.name}.${this.getFileExtension()}`,
                content: code,
                type: 'page'
            });
        }

        // Generate components
        for (const component of frontend.components) {
            const prompt = createComponentPrompt(component, this.target);
            const code = await this.llmClient.generate(this.systemPrompt, prompt);

            this.addFile({
                path: `components/${component.name}.${this.getFileExtension()}`,
                content: code,
                type: 'component'
            });
        }
    }

    /**
     * Emit backend code
     */
    async emitBackend(backend) {
        // Generate API endpoints
        for (const api of backend.apis) {
            const prompt = createAPIPrompt(api, this.target);
            const code = await this.llmClient.generate(this.systemPrompt, prompt);

            this.addFile({
                path: `routes/${api.name}.${this.getFileExtension()}`,
                content: code,
                type: 'api'
            });
        }

        // Generate queries as separate modules
        for (const query of backend.queries) {
            const code = `// Query: ${query.name}\n// ${query.description}\n\nexport async function ${query.name}() {\n  // Implementation\n  return [];\n}`;

            this.addFile({
                path: `queries/${query.name}.${this.getFileExtension()}`,
                content: code,
                type: 'query'
            });
        }
    }

    /**
     * Add a generated file
     */
    addFile(file) {
        this.generatedFiles.push(file);
    }

    /**
     * Check if target is frontend
     */
    isFrontendTarget() {
        const frontendTypes = ['react', 'vue', 'svelte', 'vanilla'];
        return frontendTypes.includes(this.target.type);
    }

    /**
     * Check if target is backend
     */
    isBackendTarget() {
        const backendTypes = ['node', 'python', 'django', 'flask'];
        return backendTypes.includes(this.target.type);
    }

    /**
     * Get file extension for target language
     */
    getFileExtension() {
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py'
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

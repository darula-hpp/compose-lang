/**
 * Code Emitter (v0.2.0)
 * Generates code from IR using LLM - simplified for model/feature/guide architecture
 */

import { createLLMClient } from './llm-client.js';
import { createFullProjectPrompt, createPartialPrompt } from './prompt-templates.js';
import { ExportMapBuilder } from './export-map-builder.js';
import { IRCache } from './ir-cache.js';
import { DependencyTracker } from './dependency-tracker.js';
import { existsSync, readFileSync, readdirSync } from 'fs';

export class CodeEmitter {
    constructor(target, options = {}) {
        this.target = target;
        this.llmConfig = options.llm || {};
        this.options = options; // Store all options
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

        // Initialize IR cache
        const irCache = new IRCache();
        const previousIR = irCache.loadIR();
        const diff = previousIR ? irCache.diff(previousIR, ir) : null;

        // Save current IR for next build
        irCache.saveIR(ir);

        // Check if we can do selective regeneration
        const canDoSelective = diff && diff.hasChanges && !this.options.forceFullBuild;

        if (canDoSelective) {
            // Get existing files from export map
            const existingFiles = this.getExistingFiles();

            // Determine affected files
            const tracker = new DependencyTracker();
            const affectedFiles = tracker.getAffectedFiles(diff, existingFiles);

            if (affectedFiles.length === 0) {
                console.log('🎯 No files affected by changes');
                return { files: [], target: this.target };
            }

            // Check if selective regeneration is worthwhile
            if (tracker.shouldUseSelectiveRegeneration(affectedFiles, existingFiles)) {
                console.log(`🎯 Selective regeneration: ${affectedFiles.length}/${existingFiles.length} files`);

                const prompt = createPartialPrompt(ir, affectedFiles, {
                    diff,
                    existingFiles
                }, this.target);

                const generatedCode = await this.llmClient.generate('', prompt);
                const files = this.parseOutput(generatedCode);

                await this.buildExportMap(files);
                return { files, target: this.target };
            }
        }

        // Fall back to full regeneration
        console.log('🏗️  Full regeneration');
        const prompt = createFullProjectPrompt(ir, this.target);
        const generatedCode = await this.llmClient.generate('', prompt);

        // Parse the output into files
        const files = this.parseOutput(generatedCode);

        // Build or update export map
        await this.buildExportMap(files);

        return {
            files,
            target: this.target
        };
    }

    /**
     * Build or update export map based on context
     * Auto-detects incremental vs full build
     * @param {Array} files - Generated files
     */
    async buildExportMap(files) {
        const exportMapBuilder = new ExportMapBuilder();
        const exportMapPath = '.compose/cache/export-map.json';

        // Auto-detect: if export map exists and not forcing full build, update incrementally
        const exportMapExists = existsSync(exportMapPath);
        const useIncremental = exportMapExists && !this.options.forceFullBuild;

        if (useIncremental) {
            console.log('🚀 Updating export map (incremental)');
            await exportMapBuilder.updateExportMap(files);
        } else {
            const buildType = this.options.forceFullBuild ? 'forced' : 'no export map found';
            console.log(`🏗️  Building export map (full build - ${buildType})`);
            await exportMapBuilder.buildExportMap(files);
        }
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
     * Get existing files from export map
     * @returns {Array} - List of existing file paths
     */
    getExistingFiles() {
        const exportMapPath = '.compose/cache/export-map.json';
        if (!existsSync(exportMapPath)) {
            return [];
        }

        try {
            const exportMapContent = readFileSync(exportMapPath, 'utf8');
            const exportMap = JSON.parse(exportMapContent);
            return Object.keys(exportMap);
        } catch (error) {
            console.warn(`⚠️  Failed to load existing files: ${error.message}`);
            return [];
        }
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

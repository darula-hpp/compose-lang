/**
 * Compose Configuration Loader and Validator
 * Validates compose.json against the official schema
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Load and validate configuration from file
 * @param {string} configPath - Path to compose.json
 * @returns {object} - Validated configuration
 */
export function loadComposeConfig(configPath = './compose.json') {
    try {
        const content = readFileSync(configPath, 'utf8');
        const config = JSON.parse(content);

        // Validate the configuration
        const errors = validateComposeConfig(config, dirname(configPath));

        if (errors.length > 0) {
            throw new Error('Configuration validation failed:\n' + errors.map(e => `  - ${e}`).join('\n'));
        }

        return config;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Config file not found: ${configPath}`);
        }
        throw error;
    }
}

/**
 * Validate configuration
 * @param {object} config - Configuration object
 * @param {string} baseDir - Base directory for resolving paths
 * @param {boolean} skipFileChecks - Skip file existence checks (for testing)
 * @returns {string[]} - Array of validation error messages (empty if valid)
 */
export function validateComposeConfig(config, baseDir = process.cwd(), skipFileChecks = false) {
    const errors = [];

    // 1. Validate LLM block (required)
    if (!config.llm) {
        errors.push('Missing required field: "llm"');
    } else {
        errors.push(...validateLLMConfig(config.llm));
    }

    // 2. Validate targets block (required, must have at least one)
    if (!config.targets) {
        errors.push('Missing required field: "targets"');
    } else if (typeof config.targets !== 'object' || Array.isArray(config.targets)) {
        errors.push('"targets" must be an object');
    } else if (Object.keys(config.targets).length === 0) {
        errors.push('"targets" must have at least one target defined');
    } else {
        // Validate each target
        const outputPaths = new Set();

        for (const [name, target] of Object.entries(config.targets)) {
            const targetErrors = validateTarget(name, target, baseDir, skipFileChecks);
            errors.push(...targetErrors);

            // Check for duplicate output paths
            if (target.output) {
                if (outputPaths.has(target.output)) {
                    errors.push(`Target "${name}": Duplicate output path "${target.output}"`);
                }
                outputPaths.add(target.output);
            }
        }
    }

    return errors;
}

/**
 * Validate LLM configuration
 * @param {object} llm - LLM config object
 * @returns {string[]} - Validation errors
 */
function validateLLMConfig(llm) {
    const errors = [];
    const validProviders = ['gemini', 'openai', 'anthropic'];

    // Required fields
    if (!llm.provider) {
        errors.push('llm.provider is required');
    } else if (!validProviders.includes(llm.provider)) {
        errors.push(`llm.provider must be one of: ${validProviders.join(', ')} (got "${llm.provider}")`);
    }

    if (!llm.model) {
        errors.push('llm.model is required');
    }

    if (!llm.apiKey) {
        errors.push('llm.apiKey is required (use environment variable syntax like "${GEMINI_API_KEY}")');
    }

    // Optional fields validation
    if (llm.temperature !== undefined) {
        if (typeof llm.temperature !== 'number' || llm.temperature < 0 || llm.temperature > 1) {
            errors.push('llm.temperature must be a number between 0 and 1');
        }
    }

    if (llm.maxTokens !== undefined) {
        if (typeof llm.maxTokens !== 'number' || llm.maxTokens < 1) {
            errors.push('llm.maxTokens must be a positive number');
        }
    }

    return errors;
}

/**
 * Infer project type from framework
 * @param {string} framework - Framework name
 * @returns {string} - Inferred type
 */
function inferTypeFromFramework(framework) {
    const frameworkTypeMap = {
        'nextjs': 'react',
        'next': 'react',
        'vite': 'react',
        'vite-react': 'react',
        'remix': 'react',
        'react-native': 'mobile',
        'flutter': 'mobile',
        'vue': 'web',
        'svelte': 'web',
        'express': 'node',
        'fastify': 'node',
        'nestjs': 'node'
    };
    return frameworkTypeMap[framework] || 'web';
}

/**
 * Validate single target configuration
 * @param {string} name - Target name
 * @param {object} target - Target config object
 * @param {string} baseDir - Base directory
 * @param {boolean} skipFileChecks - Skip file existence checks
 * @returns {string[]} - Validation errors
 */
function validateTarget(name, target, baseDir, skipFileChecks = false) {
    const errors = [];

    // Required fields
    if (!target.entry) {
        errors.push(`Target "${name}": Missing required field "entry"`);
    } else if (!skipFileChecks) {
        // Check if entry file exists (skip in tests)
        const entryPath = join(baseDir, target.entry);
        if (!existsSync(entryPath)) {
            errors.push(`Target "${name}": Entry file not found: ${target.entry}`);
        }
    }

    if (!target.language) {
        errors.push(`Target "${name}": Missing required field "language"`);
    } else {
        const validLanguages = [
            'typescript', 'javascript',
            'python', 'rust', 'go',
            'swift', 'kotlin', 'dart'
        ];
        if (!validLanguages.includes(target.language)) {
            errors.push(`Target "${name}": Invalid language "${target.language}" (must be one of: ${validLanguages.join(', ')})`);
        }
    }

    if (!target.output) {
        errors.push(`Target "${name}": Missing required field "output"`);
    }

    // Framework is NOT required (user confirmed)
    // But if provided, we can still validate it
    if (target.framework) {
        const validFrameworks = [
            'nextjs', 'vite-react', 'remix', 'vue', 'svelte',
            'express', 'fastify', 'nestjs',
            'react-native', 'flutter'
        ];
        if (!validFrameworks.includes(target.framework)) {
            // Warning, not error
            console.warn(`Target "${name}": Unknown framework "${target.framework}"`);
        }

        // Infer type from framework if not provided
        if (!target.type) {
            target.type = inferTypeFromFramework(target.framework);
        }
    }

    // Validate optional fields
    if (target.dependencies) {
        if (!Array.isArray(target.dependencies)) {
            errors.push(`Target "${name}": "dependencies" must be an array`);
        }
    }

    if (target.assets) {
        if (!Array.isArray(target.assets)) {
            errors.push(`Target "${name}": "assets" must be an array`);
        } else {
            target.assets.forEach((asset, index) => {
                if (!Array.isArray(asset) || asset.length !== 2) {
                    errors.push(`Target "${name}": assets[${index}] must be [from, to] array`);
                } else if (typeof asset[0] !== 'string' || typeof asset[1] !== 'string') {
                    errors.push(`Target "${name}": assets[${index}] must contain two strings`);
                }
            });
        }
    }

    if (target.extraRules) {
        if (!Array.isArray(target.extraRules)) {
            errors.push(`Target "${name}": "extraRules" must be an array`);
        } else if (!target.extraRules.every(r => typeof r === 'string')) {
            errors.push(`Target "${name}": "extraRules" must be an array of strings`);
        }
    }

    return errors;
}

/**
 * Get target by name
 * @param {object} config - Target configuration
 * @param {string} targetName - Target name
 * @returns {object} - Target configuration
 */
export function getTarget(config, targetName) {
    if (!config.targets[targetName]) {
        throw new Error(`Target "${targetName}" not found in configuration`);
    }

    return config.targets[targetName];
}

/**
 * Get all target names
 * @param {object} config - Target configuration
 * @returns {string[]} - Array of target names
 */
export function getTargetNames(config) {
    return Object.keys(config.targets || {});
}

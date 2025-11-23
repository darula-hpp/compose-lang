/**
 * Target Configuration Loader
 * Loads and validates compose.json configuration
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load target configuration from file
 * @param {string} configPath - Path to compose.json
 * @returns {object} - Parsed configuration with llm and targets
 */
export function loadTargetConfig(configPath = './compose.json') {
    try {
        const content = readFileSync(configPath, 'utf8');
        const config = JSON.parse(content);

        validateTargetConfig(config);

        return config;
    } catch (error) {
        throw new Error(`Failed to load config: ${error.message}`);
    }
}

/**
 * Validate target configuration structure
 * @param {object} config - Target configuration
 */
export function validateTargetConfig(config) {
    if (!config.targets) {
        throw new Error('Target config must have "targets" field');
    }

    // Validate each target
    for (const [name, target] of Object.entries(config.targets)) {
        if (!target.type) {
            throw new Error(`Target "${name}" missing required field: type`);
        }

        if (!target.output) {
            throw new Error(`Target "${name}" missing required field: output`);
        }

        const validTypes = ['react', 'vue', 'svelte', 'vanilla', 'node', 'python', 'django', 'flask'];
        if (!validTypes.includes(target.type)) {
            throw new Error(`Target "${name}" has invalid type: ${target.type}`);
        }
    }

    return true;
}

/**
 * Get target by name
 * @param {object} config - Target configuration
 * @param {string} targetName - Target name (e.g., 'frontend', 'backend')
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
    return Object.keys(config.targets);
}

/**
 * Create default target configuration
 * @param {string} targetType - Target type (react, node, etc.)
 * @returns {object} - Default target config
 */
export function createDefaultTarget(targetType) {
    const defaults = {
        react: {
            type: 'react',
            framework: 'vite',
            language: 'javascript',
            output: './generated/frontend',
            styling: 'css',
            dependencies: ['react', 'react-dom', 'react-router-dom']
        },
        node: {
            type: 'node',
            framework: 'express',
            language: 'javascript',
            output: './generated/backend',
            dependencies: ['express', 'cors']
        },
        python: {
            type: 'python',
            framework: 'flask',
            language: 'python',
            output: './generated/backend',
            dependencies: ['flask', 'flask-cors']
        }
    };

    if (!defaults[targetType]) {
        throw new Error(`No default configuration for target type: ${targetType}`);
    }

    return defaults[targetType];
}

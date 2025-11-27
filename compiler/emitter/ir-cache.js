/**
 * IR Cache
 * Caches IR between builds and detects changes for selective regeneration
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';

export class IRCache {
    constructor(cacheDir = '.compose/cache') {
        this.cacheDir = cacheDir;
        this.cachePath = `${cacheDir}/ir.json`;
    }

    /**
     * Save IR to cache
     * @param {object} ir - ComposeIR object
     */
    saveIR(ir) {
        try {
            const dir = dirname(this.cachePath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }

            const data = {
                timestamp: Date.now(),
                ir: ir,
                hash: this.calculateIRHash(ir)
            };

            writeFileSync(this.cachePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.warn(`⚠️  Failed to save IR cache: ${error.message}`);
        }
    }

    /**
     * Load previous IR from cache
     * @returns {object|null} - Previous IR or null if not found
     */
    loadIR() {
        try {
            if (!existsSync(this.cachePath)) {
                return null;
            }

            const data = JSON.parse(readFileSync(this.cachePath, 'utf8'));
            return data.ir;
        } catch (error) {
            console.warn(`⚠️  Failed to load IR cache: ${error.message}`);
            return null;
        }
    }

    /**
     * Calculate hash of IR for quick comparison
     * @param {object} ir - ComposeIR object
     * @returns {string} - SHA256 hash
     */
    calculateIRHash(ir) {
        const content = JSON.stringify(ir);
        return createHash('sha256').update(content).digest('hex');
    }

    /**
     * Detect differences between two IRs
     * @param {object} oldIR - Previous IR
     * @param {object} newIR - Current IR
     * @returns {object} - Diff object describing changes
     */
    diff(oldIR, newIR) {
        if (!oldIR) {
            return this.createFullDiff(newIR);
        }

        const diff = {
            hasChanges: false,
            models: this.diffModels(oldIR.models || [], newIR.models || []),
            features: this.diffFeatures(oldIR.features || [], newIR.features || []),
            guides: this.diffGuides(oldIR.guides || [], newIR.guides || []),
            target: this.diffTarget(oldIR.target, newIR.target),
            dependencies: this.diffDependencies(oldIR.dependencies || [], newIR.dependencies || [])
        };

        diff.hasChanges =
            diff.models.hasChanges ||
            diff.features.hasChanges ||
            diff.guides.hasChanges ||
            diff.target.hasChanges ||
            diff.dependencies.hasChanges;

        return diff;
    }

    /**
     * Create diff for initial build (everything is new)
     * @param {object} ir - Current IR
     * @returns {object} - Diff object
     */
    createFullDiff(ir) {
        return {
            hasChanges: true,
            isInitialBuild: true,
            models: {
                hasChanges: true,
                added: (ir.models || []).map(m => m.name),
                modified: [],
                removed: []
            },
            features: {
                hasChanges: true,
                added: (ir.features || []).map(f => f.name),
                modified: [],
                removed: []
            },
            guides: {
                hasChanges: true,
                added: (ir.guides || []).map(g => g.name),
                modified: [],
                removed: []
            },
            target: {
                hasChanges: false
            },
            dependencies: {
                hasChanges: false,
                added: [],
                removed: []
            }
        };
    }

    /**
     * Diff models between two IRs
     * @param {Array} oldModels - Previous models
     * @param {Array} newModels - Current models
     * @returns {object} - Model diff
     */
    diffModels(oldModels, newModels) {
        const oldMap = new Map(oldModels.map(m => [m.name, m]));
        const newMap = new Map(newModels.map(m => [m.name, m]));

        const added = [];
        const modified = [];
        const removed = [];

        // Find added and modified
        for (const [name, newModel] of newMap) {
            const oldModel = oldMap.get(name);
            if (!oldModel) {
                added.push(name);
            } else if (this.modelChanged(oldModel, newModel)) {
                modified.push(name);
            }
        }

        // Find removed
        for (const name of oldMap.keys()) {
            if (!newMap.has(name)) {
                removed.push(name);
            }
        }

        return {
            hasChanges: added.length > 0 || modified.length > 0 || removed.length > 0,
            added,
            modified,
            removed
        };
    }

    /**
     * Check if a model has changed
     * @param {object} oldModel - Previous model
     * @param {object} newModel - Current model
     * @returns {boolean} - True if changed
     */
    modelChanged(oldModel, newModel) {
        // Compare field count
        if ((oldModel.fields || []).length !== (newModel.fields || []).length) {
            return true;
        }

        // Compare each field
        const oldFields = new Map((oldModel.fields || []).map(f => [f.name, f]));
        const newFields = new Map((newModel.fields || []).map(f => [f.name, f]));

        for (const [name, newField] of newFields) {
            const oldField = oldFields.get(name);
            if (!oldField ||
                oldField.type !== newField.type ||
                oldField.required !== newField.required) {
                return true;
            }
        }

        return false;
    }

    /**
     * Diff features between two IRs
     * @param {Array} oldFeatures - Previous features
     * @param {Array} newFeatures - Current features
     * @returns {object} - Feature diff
     */
    diffFeatures(oldFeatures, newFeatures) {
        const oldMap = new Map(oldFeatures.map(f => [f.name, f]));
        const newMap = new Map(newFeatures.map(f => [f.name, f]));

        const added = [];
        const modified = [];
        const removed = [];

        for (const [name, newFeature] of newMap) {
            const oldFeature = oldMap.get(name);
            if (!oldFeature) {
                added.push(name);
            } else if (this.featureChanged(oldFeature, newFeature)) {
                modified.push(name);
            }
        }

        for (const name of oldMap.keys()) {
            if (!newMap.has(name)) {
                removed.push(name);
            }
        }

        return {
            hasChanges: added.length > 0 || modified.length > 0 || removed.length > 0,
            added,
            modified,
            removed
        };
    }

    /**
     * Check if a feature has changed
     * @param {object} oldFeature - Previous feature
     * @param {object} newFeature - Current feature
     * @returns {boolean} - True if changed
     */
    featureChanged(oldFeature, newFeature) {
        // Compare bullet count
        if ((oldFeature.bullets || []).length !== (newFeature.bullets || []).length) {
            return true;
        }

        // Compare bullets
        const oldBullets = oldFeature.bullets || [];
        const newBullets = newFeature.bullets || [];
        for (let i = 0; i < oldBullets.length; i++) {
            if (oldBullets[i] !== newBullets[i]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Diff guides between two IRs
     * @param {Array} oldGuides - Previous guides
     * @param {Array} newGuides - Current guides
     * @returns {object} - Guide diff
     */
    diffGuides(oldGuides, newGuides) {
        const oldMap = new Map(oldGuides.map(g => [g.name, g]));
        const newMap = new Map(newGuides.map(g => [g.name, g]));

        const added = [];
        const modified = [];
        const removed = [];

        for (const [name, newGuide] of newMap) {
            const oldGuide = oldMap.get(name);
            if (!oldGuide) {
                added.push(name);
            } else if (this.guideChanged(oldGuide, newGuide)) {
                modified.push(name);
            }
        }

        for (const name of oldMap.keys()) {
            if (!newMap.has(name)) {
                removed.push(name);
            }
        }

        return {
            hasChanges: added.length > 0 || modified.length > 0 || removed.length > 0,
            added,
            modified,
            removed
        };
    }

    /**
     * Check if a guide has changed
     * @param {object} oldGuide - Previous guide
     * @param {object} newGuide - Current guide
     * @returns {boolean} - True if changed
     */
    guideChanged(oldGuide, newGuide) {
        // Compare bullet count
        if ((oldGuide.bullets || []).length !== (newGuide.bullets || []).length) {
            return true;
        }

        // Compare bullets
        const oldBullets = oldGuide.bullets || [];
        const newBullets = newGuide.bullets || [];
        for (let i = 0; i < oldBullets.length; i++) {
            if (oldBullets[i] !== newBullets[i]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Diff target configuration
     * @param {object} oldTarget - Previous target
     * @param {object} newTarget - Current target
     * @returns {object} - Target diff
     */
    diffTarget(oldTarget, newTarget) {
        if (!oldTarget || !newTarget) {
            return { hasChanges: false };
        }

        const changed =
            oldTarget.type !== newTarget.type ||
            oldTarget.framework !== newTarget.framework ||
            oldTarget.language !== newTarget.language;

        return {
            hasChanges: changed,
            changes: changed ? {
                type: oldTarget.type !== newTarget.type,
                framework: oldTarget.framework !== newTarget.framework,
                language: oldTarget.language !== newTarget.language
            } : null
        };
    }

    /**
     * Diff dependencies
     * @param {Array} oldDeps - Previous dependencies
     * @param {Array} newDeps - Current dependencies
     * @returns {object} - Dependencies diff
     */
    diffDependencies(oldDeps, newDeps) {
        const oldSet = new Set(oldDeps);
        const newSet = new Set(newDeps);

        const added = newDeps.filter(d => !oldSet.has(d));
        const removed = oldDeps.filter(d => !newSet.has(d));

        return {
            hasChanges: added.length > 0 || removed.length > 0,
            added,
            removed
        };
    }

    /**
     * Clear the cached IR
     */
    clear() {
        try {
            if (existsSync(this.cachePath)) {
                writeFileSync(this.cachePath, JSON.stringify({}, null, 2), 'utf8');
            }
        } catch (error) {
            console.warn(`⚠️  Failed to clear IR cache: ${error.message}`);
        }
    }
}

/**
 * Factory function to create IRCache instance
 * @param {string} cacheDir - Cache directory path
 * @returns {IRCache} - IRCache instance
 */
export function createIRCache(cacheDir) {
    return new IRCache(cacheDir);
}

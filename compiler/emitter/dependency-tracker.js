/**
 * Dependency Tracker
 * Maps IR changes to affected files using heuristics
 */

export class DependencyTracker {
    constructor() {
        // Define rules for mapping IR changes to files
        this.rules = this.initializeRules();
    }

    /**
     * Initialize dependency rules
     * @returns {object} - Dependency rules
     */
    initializeRules() {
        return {
            // Model changes affect:
            models: {
                // Always regenerate types file
                'types/index.ts': () => true,
                'types/index.js': () => true,

                // Context files for specific models
                contextFiles: (modelName) => [
                    `context/${modelName}Context.tsx`,
                    `context/${modelName.toLowerCase()}-context.tsx`,
                    `lib/${modelName.toLowerCase()}-context.tsx`
                ],

                // Lib files that might use models
                'lib/pricing.ts': (changedModels) =>
                    changedModels.some(m => ['Order', 'Item', 'User'].includes(m)),
                'lib/pricing.js': (changedModels) =>
                    changedModels.some(m => ['Order', 'Item', 'User'].includes(m))
            },

            // Feature changes affect:
            features: {
                // Component directories matching feature names
                componentDirs: (featureName) => {
                    const normalized = featureName.toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '');
                    return [
                        `components/${normalized}/**`,
                        `components/${featureName}/**`,
                        `app/${normalized}/**`,
                        `pages/${normalized}/**`
                    ];
                },

                // Page files
                pageFiles: (featureName) => {
                    const normalized = featureName.toLowerCase()
                        .replace(/\s+/g, '-');
                    return [
                        `app/${normalized}/page.tsx`,
                        `app/${normalized}/page.jsx`,
                        `pages/${normalized}.tsx`,
                        `pages/${normalized}.jsx`
                    ];
                }
            },

            // Guide changes - pattern matching on guide names
            guides: {
                // Metadata-related guides
                metadata: {
                    patterns: ['name', 'title', 'app', 'description', 'metadata'],
                    files: [
                        'package.json',
                        'app/layout.tsx',
                        'app/layout.jsx',
                        'pages/_app.tsx',
                        'pages/_app.jsx',
                        '_app.tsx',
                        '_app.jsx'
                    ]
                },

                // Styling-related guides
                styling: {
                    patterns: ['style', 'theme', 'color', 'css', 'design'],
                    files: [
                        'app/globals.css',
                        'styles/globals.css',
                        'tailwind.config.ts',
                        'tailwind.config.js',
                        'app/layout.tsx',
                        'app/layout.jsx'
                    ]
                },

                // Configuration guides
                config: {
                    patterns: ['config', 'setup', 'environment', 'env'],
                    files: [
                        'next.config.js',
                        'vite.config.js',
                        'package.json'
                    ]
                }
            },

            // Target changes - regenerate everything
            target: {
                framework: () => 'all', // Framework change = full regeneration
                type: () => 'all',
                language: () => 'all'
            },

            // Dependencies changes
            dependencies: {
                'package.json': () => true
            }
        };
    }

    /**
     * Get files affected by IR changes
     * @param {object} diff - IR diff from IRCache
     * @param {Array} existingFiles - List of existing file paths
     * @returns {Array} - List of affected file paths
     */
    getAffectedFiles(diff, existingFiles = []) {
        if (!diff.hasChanges) {
            return [];
        }

        // If target changed, regenerate everything
        if (diff.target?.hasChanges) {
            return existingFiles;
        }

        const affected = new Set();

        // Handle model changes
        if (diff.models?.hasChanges) {
            this.addModelAffectedFiles(diff.models, existingFiles, affected);
        }

        // Handle feature changes
        if (diff.features?.hasChanges) {
            this.addFeatureAffectedFiles(diff.features, existingFiles, affected);
        }

        // Handle guide changes
        if (diff.guides?.hasChanges) {
            this.addGuideAffectedFiles(diff.guides, existingFiles, affected);
        }

        // Handle dependency changes
        if (diff.dependencies?.hasChanges) {
            this.addDependencyAffectedFiles(existingFiles, affected);
        }

        return Array.from(affected);
    }

    /**
     * Add files affected by model changes
     * @param {object} modelsDiff - Models diff
     * @param {Array} existingFiles - Existing files
     * @param {Set} affected - Set of affected files
     */
    addModelAffectedFiles(modelsDiff, existingFiles, affected) {
        const changedModels = [
            ...modelsDiff.added,
            ...modelsDiff.modified
        ];

        // Always regenerate types files
        existingFiles.forEach(file => {
            if (file.includes('types/index')) {
                affected.add(file);
            }
        });

        // Add context files for changed models
        changedModels.forEach(modelName => {
            const contextPatterns = this.rules.models.contextFiles(modelName);
            existingFiles.forEach(file => {
                if (contextPatterns.some(pattern => file.includes(pattern))) {
                    affected.add(file);
                }
            });
        });

        // Check pricing lib if relevant models changed
        if (this.rules.models['lib/pricing.ts'](changedModels)) {
            existingFiles.forEach(file => {
                if (file.includes('lib/pricing')) {
                    affected.add(file);
                }
            });
        }
    }

    /**
     * Add files affected by feature changes
     * @param {object} featuresDiff - Features diff
     * @param {Array} existingFiles - Existing files
     * @param {Set} affected - Set of affected files
     */
    addFeatureAffectedFiles(featuresDiff, existingFiles, affected) {
        const changedFeatures = [
            ...featuresDiff.added,
            ...featuresDiff.modified
        ];

        changedFeatures.forEach(featureName => {
            // Get component directories
            const componentDirs = this.rules.features.componentDirs(featureName);
            const pageFiles = this.rules.features.pageFiles(featureName);

            const patterns = [...componentDirs, ...pageFiles];

            existingFiles.forEach(file => {
                if (patterns.some(pattern => this.matchPattern(file, pattern))) {
                    affected.add(file);
                }
            });
        });
    }

    /**
     * Add files affected by guide changes
     * @param {object} guidesDiff - Guides diff
     * @param {Array} existingFiles - Existing files
     * @param {Set} affected - Set of affected files
     */
    addGuideAffectedFiles(guidesDiff, existingFiles, affected) {
        const changedGuides = [
            ...guidesDiff.added,
            ...guidesDiff.modified
        ];

        changedGuides.forEach(guideName => {
            const lowerName = guideName.toLowerCase();

            // Check metadata patterns
            if (this.matchesAnyPattern(lowerName, this.rules.guides.metadata.patterns)) {
                this.addMatchingFiles(existingFiles, this.rules.guides.metadata.files, affected);
            }

            // Check styling patterns
            if (this.matchesAnyPattern(lowerName, this.rules.guides.styling.patterns)) {
                this.addMatchingFiles(existingFiles, this.rules.guides.styling.files, affected);
            }

            // Check config patterns
            if (this.matchesAnyPattern(lowerName, this.rules.guides.config.patterns)) {
                this.addMatchingFiles(existingFiles, this.rules.guides.config.files, affected);
            }
        });
    }

    /**
     * Add files affected by dependency changes
     * @param {Array} existingFiles - Existing files
     * @param {Set} affected - Set of affected files
     */
    addDependencyAffectedFiles(existingFiles, affected) {
        existingFiles.forEach(file => {
            if (file.includes('package.json')) {
                affected.add(file);
            }
        });
    }

    /**
     * Check if string matches any pattern
     * @param {string} str - String to check
     * @param {Array} patterns - Patterns to match
     * @returns {boolean} - True if matches
     */
    matchesAnyPattern(str, patterns) {
        return patterns.some(pattern => str.includes(pattern));
    }

    /**
     * Add files matching any of the given paths
     * @param {Array} existingFiles - Existing files
     * @param {Array} paths - Paths to match
     * @param {Set} affected - Set of affected files
     */
    addMatchingFiles(existingFiles, paths, affected) {
        existingFiles.forEach(file => {
            if (paths.some(path => file.includes(path))) {
                affected.add(file);
            }
        });
    }

    /**
     * Match file path against pattern (supports ** glob)
     * @param {string} filePath - File path
     * @param {string} pattern - Pattern (supports **)
     * @returns {boolean} - True if matches
     */
    matchPattern(filePath, pattern) {
        // Simple pattern matching
        // components/cart/** matches components/cart/anything
        if (pattern.includes('**')) {
            const prefix = pattern.split('**')[0];
            return filePath.includes(prefix);
        }

        return filePath.includes(pattern);
    }

    /**
     * Estimate selectivity - what % of files are affected
     * @param {Array} affectedFiles - Affected files
     * @param {Array} allFiles - All files
     * @returns {number} - Percentage (0-100)
     */
    estimateSelectivity(affectedFiles, allFiles) {
        if (allFiles.length === 0) return 0;
        return (affectedFiles.length / allFiles.length) * 100;
    }

    /**
     * Determine if selective regeneration is worthwhile
     * @param {Array} affectedFiles - Affected files
     * @param {Array} allFiles - All files
     * @param {number} threshold - Threshold percentage (default 50%)
     * @returns {boolean} - True if selective regeneration recommended
     */
    shouldUseSelectiveRegeneration(affectedFiles, allFiles, threshold = 50) {
        const selectivity = this.estimateSelectivity(affectedFiles, allFiles);
        return selectivity < threshold;
    }
}

/**
 * Factory function to create DependencyTracker instance
 * @returns {DependencyTracker} - DependencyTracker instance
 */
export function createDependencyTracker() {
    return new DependencyTracker();
}

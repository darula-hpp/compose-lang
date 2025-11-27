/**
 * Tests for Dependency Tracker
 * Verifies mapping of IR changes to affected files
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { DependencyTracker } from '../dependency-tracker.js';

describe('DependencyTracker', () => {
    describe('constructor', () => {
        it('should initialize with rules', () => {
            const tracker = new DependencyTracker();
            assert.ok(tracker.rules);
            assert.ok(tracker.rules.models);
            assert.ok(tracker.rules.features);
            assert.ok(tracker.rules.guides);
        });
    });

    describe('getAffectedFiles - models', () => {
        it('should mark types file as affected when model added', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: {
                    hasChanges: true,
                    added: ['User'],
                    modified: [],
                    removed: []
                },
                features: { hasChanges: false },
                guides: { hasChanges: false },
                target: { hasChanges: false }
            };
            const existingFiles = ['types/index.ts', 'components/App.tsx'];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('types/index.ts'));
        });

        it('should mark context files as affected when model changes', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: {
                    hasChanges: true,
                    added: [],
                    modified: ['Cart'],
                    removed: []
                },
                features: { hasChanges: false },
                guides: { hasChanges: false },
                target: { hasChanges: false }
            };
            const existingFiles = [
                'types/index.ts',
                'context/CartContext.tsx',
                'components/Header.tsx'
            ];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('context/CartContext.tsx'));
        });

        it('should mark pricing lib as affected when Order model changes', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: {
                    hasChanges: true,
                    added: [],
                    modified: ['Order'],
                    removed: []
                },
                features: { hasChanges: false },
                guides: { hasChanges: false },
                target: { hasChanges: false }
            };
            const existingFiles = ['types/index.ts', 'lib/pricing.ts'];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('lib/pricing.ts'));
        });
    });

    describe('getAffectedFiles - features', () => {
        it('should mark feature components as affected', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: { hasChanges: false },
                features: {
                    hasChanges: true,
                    added: ['Shopping Cart'],
                    modified: [],
                    removed: []
                },
                guides: { hasChanges: false },
                target: { hasChanges: false }
            };
            const existingFiles = [
                'components/shopping-cart/CartItem.tsx',
                'components/Header.tsx'
            ];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('components/shopping-cart/CartItem.tsx'));
            assert.ok(!affected.includes('components/Header.tsx'));
        });

        it('should mark feature page as affected', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: { hasChanges: false },
                features: {
                    hasChanges: true,
                    added: [],
                    modified: ['Checkout'],
                    removed: []
                },
                guides: { hasChanges: false },
                target: { hasChanges: false }
            };
            const existingFiles = [
                'app/checkout/page.tsx',
                'app/cart/page.tsx'
            ];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('app/checkout/page.tsx'));
            assert.ok(!affected.includes('app/cart/page.tsx'));
        });
    });

    describe('getAffectedFiles - guides', () => {
        it('should mark metadata files as affected for app name guide', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: { hasChanges: false },
                features: { hasChanges: false },
                guides: {
                    hasChanges: true,
                    added: ['App Name'],
                    modified: [],
                    removed: []
                },
                target: { hasChanges: false }
            };
            const existingFiles = [
                'package.json',
                'app/layout.tsx',
                'components/Header.tsx'
            ];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('package.json'));
            assert.ok(affected.includes('app/layout.tsx'));
            assert.ok(!affected.includes('components/Header.tsx'));
        });

        it('should mark styling files as affected for theme guide', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: { hasChanges: false },
                features: { hasChanges: false },
                guides: {
                    hasChanges: true,
                    added: ['Color Theme'],
                    modified: [],
                    removed: []
                },
                target: { hasChanges: false }
            };
            const existingFiles = [
                'app/globals.css',
                'tailwind.config.ts',
                'components/Button.tsx'
            ];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.ok(affected.includes('app/globals.css'));
            assert.ok(affected.includes('tailwind.config.ts'));
        });
    });

    describe('getAffectedFiles - target changes', () => {
        it('should regenerate all files when target changes', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: true,
                models: { hasChanges: false },
                features: { hasChanges: false },
                guides: { hasChanges: false },
                target: {
                    hasChanges: true,
                    changes: { framework: true }
                }
            };
            const existingFiles = ['file1.ts', 'file2.ts', 'file3.ts'];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.strictEqual(affected.length, 3);
            assert.deepStrictEqual(affected, existingFiles);
        });
    });

    describe('getAffectedFiles - no changes', () => {
        it('should return empty array when no changes', () => {
            const tracker = new DependencyTracker();
            const diff = {
                hasChanges: false,
                models: { hasChanges: false },
                features: { hasChanges: false },
                guides: { hasChanges: false },
                target: { hasChanges: false }
            };
            const existingFiles = ['file1.ts', 'file2.ts'];

            const affected = tracker.getAffectedFiles(diff, existingFiles);

            assert.strictEqual(affected.length, 0);
        });
    });

    describe('estimateSelectivity', () => {
        it('should calculate selectivity percentage', () => {
            const tracker = new DependencyTracker();
            const affected = ['file1.ts', 'file2.ts'];
            const all = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts'];

            const selectivity = tracker.estimateSelectivity(affected, all);

            assert.strictEqual(selectivity, 40); // 2/5 = 40%
        });

        it('should return 0 when no files', () => {
            const tracker = new DependencyTracker();
            const selectivity = tracker.estimateSelectivity([], []);

            assert.strictEqual(selectivity, 0);
        });
    });

    describe('shouldUseSelectiveRegeneration', () => {
        it('should recommend selective when less than 50% affected', () => {
            const tracker = new DependencyTracker();
            const affected = ['file1.ts', 'file2.ts'];
            const all = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts'];

            const should = tracker.shouldUseSelectiveRegeneration(affected, all);

            assert.strictEqual(should, true);
        });

        it('should not recommend selective when more than 50% affected', () => {
            const tracker = new DependencyTracker();
            const affected = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts'];
            const all = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts'];

            const should = tracker.shouldUseSelectiveRegeneration(affected, all);

            assert.strictEqual(should, false);
        });

        it('should use custom threshold', () => {
            const tracker = new DependencyTracker();
            const affected = ['file1.ts', 'file2.ts'];
            const all = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts'];

            const should = tracker.shouldUseSelectiveRegeneration(affected, all, 30);

            assert.strictEqual(should, false); // 40% > 30%
        });
    });
});

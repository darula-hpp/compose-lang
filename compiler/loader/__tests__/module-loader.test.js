/**
 * Module Loader Tests
 * Tests for import resolution, dependency tracking, and module caching
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { ModuleLoader } from '../module-loader.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('ModuleLoader', () => {
    let loader;
    let testDir;

    beforeEach(() => {
        // Create temporary test directory
        testDir = join(process.cwd(), '__test_modules__');
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
        mkdirSync(testDir, { recursive: true });
        loader = new ModuleLoader(testDir);
    });

    afterEach(() => {
        // Clean up test directory
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('Basic Module Loading', () => {
        it('should load a simple module without imports', () => {
            const source = `model User:
  name: text
  email: text`;

            writeFileSync(join(testDir, 'user.compose'), source);

            const module = loader.loadModule('user.compose');

            assert.ok(module);
            assert.equal(module.path, join(testDir, 'user.compose'));
            assert.ok(module.ast);
            assert.equal(module.dependencies.length, 0);
        });

        it('should cache loaded modules', () => {
            const source = `model Product:
  id: number
  name: text`;

            writeFileSync(join(testDir, 'product.compose'), source);

            const module1 = loader.loadModule('product.compose');
            const module2 = loader.loadModule('product.compose');

            assert.strictEqual(module1, module2);
        });

        it('should throw error for non-existent module', () => {
            assert.throws(() => {
                loader.loadModule('nonexistent.compose');
            }, /Module not found/);
        });
    });

    describe('Path Resolution', () => {
        it('should automatically add .compose extension', () => {
            const source = `model Test:
  id: number`;

            writeFileSync(join(testDir, 'test.compose'), source);

            const module = loader.loadModule('test'); // No .compose extension
            assert.ok(module);
            assert.ok(module.path.endsWith('test.compose'));
        });

        it('should resolve relative paths from importing file', () => {
            mkdirSync(join(testDir, 'models'), { recursive: true });

            const userSource = `model User:
  id: number`;
            const orderSource = `import "./user.compose"

model Order:
  userId: User`;

            writeFileSync(join(testDir, 'models', 'user.compose'), userSource);
            writeFileSync(join(testDir, 'models', 'order.compose'), orderSource);

            const orderModule = loader.loadModule('models/order.compose');

            assert.ok(orderModule);
            assert.equal(orderModule.dependencies.length, 1);
            assert.equal(orderModule.dependencies[0], './user.compose');
        });

        it('should resolve paths from src directory', () => {
            mkdirSync(join(testDir, 'src'), { recursive: true });

            const source = `model Config:
  apiKey: text`;

            writeFileSync(join(testDir, 'src', 'config.compose'), source);

            const module = loader.loadModule('config.compose');
            assert.ok(module);
            assert.ok(module.path.includes('src'));
        });

        it('should resolve .. relative paths', () => {
            mkdirSync(join(testDir, 'shared'), { recursive: true });
            mkdirSync(join(testDir, 'features'), { recursive: true });

            const sharedSource = `model SharedType:
  id: number`;
            const featureSource = `import "../shared/types.compose"

model Feature:
  typeId: SharedType`;

            writeFileSync(join(testDir, 'shared', 'types.compose'), sharedSource);
            writeFileSync(join(testDir, 'features', 'feature.compose'), featureSource);

            const featureModule = loader.loadModule('features/feature.compose');

            assert.ok(featureModule);
            assert.equal(featureModule.dependencies.length, 1);
        });
    });

    describe('Dependency Loading', () => {
        it('should load dependencies recursively', () => {
            const baseSource = `model Base:
  id: number`;

            const middleSource = `import "base.compose"

model Middle:
  baseId: Base`;

            const topSource = `import "middle.compose"

model Top:
  middleId: Middle`;

            writeFileSync(join(testDir, 'base.compose'), baseSource);
            writeFileSync(join(testDir, 'middle.compose'), middleSource);
            writeFileSync(join(testDir, 'top.compose'), topSource);

            loader.loadModule('top.compose');

            const allModules = loader.getAllModules();
            assert.equal(allModules.length, 3);
        });

        it('should extract import dependencies correctly', () => {
            const source = `import "shared/user.compose"
import "shared/product.compose"

model Order:
  userId: User
  productId: Product`;

            writeFileSync(join(testDir, 'order.compose'), source);
            mkdirSync(join(testDir, 'shared'), { recursive: true });
            writeFileSync(join(testDir, 'shared', 'user.compose'), 'model User:\n  id: number');
            writeFileSync(join(testDir, 'shared', 'product.compose'), 'model Product:\n  id: number');

            const module = loader.loadModule('order.compose');

            assert.equal(module.dependencies.length, 2);
            assert.ok(module.dependencies.includes('shared/user.compose'));
            assert.ok(module.dependencies.includes('shared/product.compose'));
        });
    });

    describe('Circular Import Detection', () => {
        it('should detect direct circular imports', () => {
            const aSource = `import "b.compose"

model A:
  b: B`;

            const bSource = `import "a.compose"

model B:
  a: A`;

            writeFileSync(join(testDir, 'a.compose'), aSource);
            writeFileSync(join(testDir, 'b.compose'), bSource);

            assert.throws(() => {
                loader.loadModule('a.compose');
            }, /Circular import detected/);
        });

        it('should detect indirect circular imports', () => {
            const aSource = `import "b.compose"

model A:
  id: number`;

            const bSource = `import "c.compose"

model B:
  id: number`;

            const cSource = `import "a.compose"

model C:
  id: number`;

            writeFileSync(join(testDir, 'a.compose'), aSource);
            writeFileSync(join(testDir, 'b.compose'), bSource);
            writeFileSync(join(testDir, 'c.compose'), cSource);

            assert.throws(() => {
                loader.loadModule('a.compose');
            }, /Circular import detected/);
        });
    });

    describe('Topological Ordering', () => {
        it('should order modules by dependencies', () => {
            const aSource = `model A:
  id: number`;

            const bSource = `import "a.compose"

model B:
  aId: A`;

            const cSource = `import "b.compose"

model C:
  bId: B`;

            writeFileSync(join(testDir, 'a.compose'), aSource);
            writeFileSync(join(testDir, 'b.compose'), bSource);
            writeFileSync(join(testDir, 'c.compose'), cSource);

            loader.loadModule('c.compose');
            const ordered = loader.getTopologicalOrder();

            assert.equal(ordered.length, 3);

            // A should come before B, B should come before C
            const aIndex = ordered.findIndex(m => m.path.endsWith('a.compose'));
            const bIndex = ordered.findIndex(m => m.path.endsWith('b.compose'));
            const cIndex = ordered.findIndex(m => m.path.endsWith('c.compose'));

            assert.ok(aIndex < bIndex);
            assert.ok(bIndex < cIndex);
        });

        it('should handle multiple independent dependency chains', () => {
            const x1Source = `model X1:
  id: number`;
            const x2Source = `import "x1.compose"

model X2:
  x1Id: X1`;

            const y1Source = `model Y1:
  id: number`;
            const y2Source = `import "y1.compose"

model Y2:
  y1Id: Y1`;

            const mainSource = `import "x2.compose"
import "y2.compose"

model Main:
  x2Id: X2
  y2Id: Y2`;

            writeFileSync(join(testDir, 'x1.compose'), x1Source);
            writeFileSync(join(testDir, 'x2.compose'), x2Source);
            writeFileSync(join(testDir, 'y1.compose'), y1Source);
            writeFileSync(join(testDir, 'y2.compose'), y2Source);
            writeFileSync(join(testDir, 'main.compose'), mainSource);

            loader.loadModule('main.compose');
            const ordered = loader.getTopologicalOrder();

            assert.equal(ordered.length, 5);

            // Verify dependency order is maintained
            const getIndex = (name) => ordered.findIndex(m => m.path.endsWith(name));
            assert.ok(getIndex('x1.compose') < getIndex('x2.compose'));
            assert.ok(getIndex('y1.compose') < getIndex('y2.compose'));
            assert.ok(getIndex('x2.compose') < getIndex('main.compose'));
            assert.ok(getIndex('y2.compose') < getIndex('main.compose'));
        });
    });

    describe('Cache Management', () => {
        it('should clear cache', () => {
            const source = `model User:
  id: number`;

            writeFileSync(join(testDir, 'user.compose'), source);

            loader.loadModule('user.compose');
            assert.equal(loader.getAllModules().length, 1);

            loader.clear();
            assert.equal(loader.getAllModules().length, 0);
        });

        it('should get module by path', () => {
            const source = `model Product:
  id: number`;

            writeFileSync(join(testDir, 'product.compose'), source);

            loader.loadModule('product.compose');
            const module = loader.getModule(join(testDir, 'product.compose'));

            assert.ok(module);
            assert.ok(module.ast);
        });
    });

    describe('Error Handling', () => {
        it('should handle syntax errors in imported modules', () => {
            const invalidSource = `model Invalid
  # Missing colon and fields`;

            writeFileSync(join(testDir, 'invalid.compose'), invalidSource);

            assert.throws(() => {
                loader.loadModule('invalid.compose');
            }, /Failed to compile/);
        });

        it('should provide helpful error for missing imports', () => {
            const source = `import "missing.compose"

model Test:
  id: number`;

            writeFileSync(join(testDir, 'test.compose'), source);

            assert.throws(() => {
                loader.loadModule('test.compose');
            }, /Module not found/);
        });
    });
});

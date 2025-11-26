/**
 * Export Map Builder Tests
 * Tests for AST parsing and export extraction
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { ExportMapBuilder } from '../export-map-builder.js';

describe('ExportMapBuilder', () => {
    describe('Extract Functions', () => {
        it('should extract simple function with typed parameters', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export function greet(name: string): string {
    return \`Hello \${name}\`;
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.greet);
            assert.strictEqual(exports.greet.kind, 'function');
            assert.strictEqual(exports.greet.params.length, 1);
            assert.strictEqual(exports.greet.params[0].name, 'name');
            assert.strictEqual(exports.greet.params[0].type, 'string');
            assert.strictEqual(exports.greet.params[0].required, true);
            assert.strictEqual(exports.greet.returns, 'string');
            assert.strictEqual(exports.greet.async, false);
        });

        it('should extract async function', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export async function fetchUser(id: string): Promise<string> {
    return 'user';
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.fetchUser);
            assert.strictEqual(exports.fetchUser.async, true);
            assert.strictEqual(exports.fetchUser.returns, 'Promise<string>');
        });

        it('should extract function with optional parameters', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export function calculate(a: number, b?: number): number {
    return a + (b || 0);
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.strictEqual(exports.calculate.params.length, 2);
            assert.strictEqual(exports.calculate.params[0].required, true);
            assert.strictEqual(exports.calculate.params[1].required, false);
        });

        it('should extract function with no parameters', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export function getCurrentTime(): number {
    return Date.now();
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.getCurrentTime);
            assert.strictEqual(exports.getCurrentTime.params.length, 0);
            assert.strictEqual(exports.getCurrentTime.returns, 'number');
        });
    });

    describe('Extract Interfaces', () => {
        it('should extract interface with properties', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export interface User {
    id: string;
    email: string;
    name: string;
    age: number;
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.User);
            assert.strictEqual(exports.User.kind, 'interface');
            assert.strictEqual(exports.User.properties.length, 4);
            assert.ok(exports.User.properties.includes('id: string'));
            assert.ok(exports.User.properties.includes('email: string'));
            assert.ok(exports.User.properties.includes('name: string'));
            assert.ok(exports.User.properties.includes('age: number'));
        });

        it('should extract interface with complex types', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export interface Product {
    tags: string[];
    reviews: Review[];
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.Product);
            assert.ok(exports.Product.properties.includes('tags: string[]'));
            assert.ok(exports.Product.properties.includes('reviews: Review[]'));
        });

        it('should extract empty interface', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export interface EmptyInterface {
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.EmptyInterface);
            assert.strictEqual(exports.EmptyInterface.properties.length, 0);
        });
    });

    describe('Extract Classes', () => {
        it('should extract class with methods', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }
    
    async fetchData(): Promise<void> {
        // implementation
    }
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.Calculator);
            assert.strictEqual(exports.Calculator.kind, 'class');
            assert.strictEqual(exports.Calculator.methods.length, 2);

            const addMethod = exports.Calculator.methods.find(m => m.name === 'add');
            assert.ok(addMethod);
            assert.strictEqual(addMethod.async, false);

            const fetchMethod = exports.Calculator.methods.find(m => m.name === 'fetchData');
            assert.ok(fetchMethod);
            assert.strictEqual(fetchMethod.async, true);
        });

        it('should extract class with static methods', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export class MathUtils {
    static PI = 3.14;
    
    static calculateArea(radius: number): number {
        return this.PI * radius * radius;
    }
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.MathUtils);
            const staticMethod = exports.MathUtils.methods.find(m => m.name === 'calculateArea');
            assert.ok(staticMethod);
            assert.strictEqual(staticMethod.static, true);
        });
    });

    describe('Extract Enums', () => {
        it('should extract enum with string values', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export enum UserRole {
    Admin = 'admin',
    User = 'user',
    Guest = 'guest'
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.UserRole);
            assert.strictEqual(exports.UserRole.kind, 'enum');
            assert.strictEqual(exports.UserRole.values.length, 3);
            assert.ok(exports.UserRole.values.includes("Admin = 'admin'"));
            assert.ok(exports.UserRole.values.includes("User = 'user'"));
            assert.ok(exports.UserRole.values.includes("Guest = 'guest'"));
        });

        it('should extract enum with numeric values', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export enum Status {
    Pending = 0,
    Active = 1,
    Completed = 2
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.Status);
            assert.strictEqual(exports.Status.values.length, 3);
            assert.ok(exports.Status.values.includes('Pending = 0'));
        });

        it('should extract enum with auto-numbered values', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export enum Direction {
    North,
    South,
    East,
    West
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.Direction);
            assert.strictEqual(exports.Direction.values.length, 4);
            assert.ok(exports.Direction.values.includes('North'));
            assert.ok(exports.Direction.values.includes('West'));
        });
    });

    describe('Extract Type Aliases', () => {
        it('should extract simple type alias', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export type ID = string;
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.ID);
            assert.strictEqual(exports.ID.kind, 'type');
            assert.strictEqual(exports.ID.typeDefinition, 'string');
        });

        it('should extract union type', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export type Status = 'pending' | 'active' | 'completed';
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.Status);
            assert.strictEqual(exports.Status.kind, 'type');
        });
    });

    describe('Extract Variables', () => {
        it('should extract const variable', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export const API_URL = 'https://api.example.com';
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.API_URL);
            assert.strictEqual(exports.API_URL.kind, 'variable');
            assert.strictEqual(exports.API_URL.const, true);
        });

        it('should extract typed const', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'test.ts',
                content: `
export const MAX_USERS: number = 100;
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.MAX_USERS);
            assert.strictEqual(exports.MAX_USERS.type, 'number');
        });
    });

    describe('Build Export Map', () => {
        it('should build export map from multiple files', async () => {
            const builder = new ExportMapBuilder('.compose/test-cache');
            const files = [
                {
                    path: 'models/User.ts',
                    relativePath: 'models/User.ts',
                    content: `
export interface User {
    id: string;
    name: string;
}

export function createUser(name: string): User {
    return { id: '1', name };
}
                    `
                },
                {
                    path: 'utils/helpers.ts',
                    relativePath: 'utils/helpers.ts',
                    content: `
export const capitalize = (str: string): string => str.toUpperCase();
                    `
                }
            ];

            const exportMap = await builder.buildExportMap(files);

            assert.ok(exportMap['models/User.ts']);
            assert.ok(exportMap['models/User.ts'].exports.User);
            assert.ok(exportMap['models/User.ts'].exports.createUser);

            assert.ok(exportMap['utils/helpers.ts']);
            assert.ok(exportMap['utils/helpers.ts'].exports.capitalize);
        });

        it('should skip non-JavaScript files', async () => {
            const builder = new ExportMapBuilder('.compose/test-cache');
            const files = [
                {
                    path: 'README.md',
                    relativePath: 'README.md',
                    content: '# Title'
                },
                {
                    path: 'config.json',
                    relativePath: 'config.json',
                    content: '{}'
                }
            ];

            const exportMap = await builder.buildExportMap(files);

            assert.strictEqual(Object.keys(exportMap).length, 0);
        });

        it('should handle files with no exports', async () => {
            const builder = new ExportMapBuilder('.compose/test-cache');
            const files = [
                {
                    path: 'utils/internal.ts',
                    relativePath: 'utils/internal.ts',
                    content: `
function internalHelper() {
    return 'private';
}
                    `
                }
            ];

            const exportMap = await builder.buildExportMap(files);

            assert.ok(exportMap['utils/internal.ts']);
            assert.strictEqual(Object.keys(exportMap['utils/internal.ts'].exports).length, 0);
        });
    });

    describe('Update Export Map', () => {
        it('should update only modified files', async () => {
            const builder = new ExportMapBuilder('.compose/test-cache');

            // First, build full map
            const initialFiles = [
                {
                    path: 'models/User.ts',
                    relativePath: 'models/User.ts',
                    content: `export interface User { id: string; }`
                },
                {
                    path: 'models/Product.ts',
                    relativePath: 'models/Product.ts',
                    content: `export interface Product { id: string; }`
                }
            ];

            const initialMap = await builder.buildExportMap(initialFiles);
            const initialUserTimestamp = initialMap['models/User.ts'].lastUpdated;

            // Small delay to ensure timestamp changes
            await new Promise(resolve => setTimeout(resolve, 10));

            // Now update only User
            const modifiedFiles = [
                {
                    path: 'models/User.ts',
                    relativePath: 'models/User.ts',
                    content: `export interface User { id: string; name: string; }`
                }
            ];

            // Simulate loading previous map
            builder.loadExportMap = () => initialMap;

            const updatedMap = await builder.updateExportMap(modifiedFiles);

            // User should be updated
            assert.ok(updatedMap['models/User.ts'].exports.User.properties.includes('name: string'));
            assert.ok(updatedMap['models/User.ts'].lastUpdated > initialUserTimestamp);

            // Product should still exist (not replaced)
            assert.ok(updatedMap['models/Product.ts']);
        });
    });

    describe('Edge Cases', () => {
        it('should handle syntax errors gracefully', async () => {
            const builder = new ExportMapBuilder('.compose/test-cache');
            const files = [
                {
                    path: 'broken.ts',
                    relativePath: 'broken.ts',
                    content: `
export function incomplete( { // Syntax error
                    `
                }
            ];

            // Should not throw, just skip the file
            const exportMap = await builder.buildExportMap(files);

            // File should not be in export map due to parse error
            assert.strictEqual(Object.keys(exportMap).length, 0);
        });

        it('should handle multiple exports in one file', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'multi.ts',
                content: `
export interface User { id: string; }
export interface Product { id: string; }
export function helper() {}
export const CONFIG = {};
export enum Status { Active, Inactive }
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.strictEqual(Object.keys(exports).length, 5);
            assert.ok(exports.User);
            assert.ok(exports.Product);
            assert.ok(exports.helper);
            assert.ok(exports.CONFIG);
            assert.ok(exports.Status);
        });

        it('should handle default exports', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 'default.ts',
                content: `
export default function main() {
    return 'main';
}
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.default);
            assert.strictEqual(exports.default.kind, 'function');
        });

        it('should handle re-exports', async () => {
            const builder = new ExportMapBuilder();
            const file = {
                path: 're-export.ts',
                content: `
export { User, Product } from './models';
                `
            };

            const exports = await builder.extractExportsFromFile(file);

            assert.ok(exports.User);
            assert.strictEqual(exports.User.kind, 'reexport');
            assert.ok(exports.Product);
            assert.strictEqual(exports.Product.kind, 'reexport');
        });
    });

    describe('File Type Detection', () => {
        it('should detect JavaScript files', () => {
            const builder = new ExportMapBuilder();

            assert.strictEqual(builder.isJavaScriptFile('file.js'), true);
            assert.strictEqual(builder.isJavaScriptFile('file.jsx'), true);
            assert.strictEqual(builder.isJavaScriptFile('file.ts'), true);
            assert.strictEqual(builder.isJavaScriptFile('file.tsx'), true);
        });

        it('should reject non-JavaScript files', () => {
            const builder = new ExportMapBuilder();

            assert.strictEqual(builder.isJavaScriptFile('file.md'), false);
            assert.strictEqual(builder.isJavaScriptFile('file.json'), false);
            assert.strictEqual(builder.isJavaScriptFile('file.css'), false);
            assert.strictEqual(builder.isJavaScriptFile('file.py'), false);
        });
    });
});

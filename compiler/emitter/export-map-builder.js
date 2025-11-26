/**
 * Export Map Builder
 * Parses generated TypeScript/JavaScript files and extracts exported symbols
 * with their full signatures for use in incremental code generation.
 */

import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// @babel/traverse is a CommonJS module, need to access default
const traverse = babelTraverse.default || babelTraverse;

export class ExportMapBuilder {
    /**
     * @param {string} cacheDir - Directory to store export map
     */
    constructor(cacheDir = '.compose/cache') {
        this.cacheDir = cacheDir;
        this.exportMapFile = `${cacheDir}/export-map.json`;
    }

    /**
     * Build export map from generated files (full build)
     * @param {Array} files - Array of {path, content, relativePath} objects
     * @returns {Promise<Object>} - Export map
     */
    async buildExportMap(files) {
        const exportMap = {};

        for (const file of files) {
            // Only process TypeScript/JavaScript files
            if (!this.isJavaScriptFile(file.path)) {
                continue;
            }

            try {
                const exports = await this.extractExportsFromFile(file);
                const relativePath = file.relativePath || this.getRelativePath(file.path);

                exportMap[relativePath] = {
                    path: file.path,
                    exports: exports,
                    lastUpdated: Date.now()
                };
            } catch (error) {
                console.warn(`Failed to parse ${file.path}: ${error.message}`);
                // Continue with other files
            }
        }

        await this.saveExportMap(exportMap);
        return exportMap;
    }

    /**
     * Update export map with newly generated files (incremental)
     * @param {Array} files - Only the files that were regenerated
     * @returns {Promise<Object>} - Updated export map
     */
    async updateExportMap(files) {
        // Load existing export map
        const exportMap = this.loadExportMap();

        for (const file of files) {
            if (!this.isJavaScriptFile(file.path)) {
                continue;
            }

            try {
                const exports = await this.extractExportsFromFile(file);
                const relativePath = file.relativePath || this.getRelativePath(file.path);

                exportMap[relativePath] = {
                    path: file.path,
                    exports: exports,
                    lastUpdated: Date.now()
                };
            } catch (error) {
                console.warn(`Failed to parse ${file.path}: ${error.message}`);
            }
        }

        await this.saveExportMap(exportMap);
        return exportMap;
    }

    /**
     * Remove entries for deleted files
     * @param {Array<string>} deletedFilePaths - Relative paths of deleted files
     */
    async removeFromExportMap(deletedFilePaths) {
        const exportMap = this.loadExportMap();

        for (const filePath of deletedFilePaths) {
            delete exportMap[filePath];
        }

        await this.saveExportMap(exportMap);
    }

    /**
     * Extract exports from a single file
     * @param {Object} file - File object with path and content
     * @returns {Promise<Object>} - Extracted exports
     */
    async extractExportsFromFile(file) {
        const exports = {};

        // Parse TypeScript/JavaScript with Babel
        const ast = parse(file.content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx']
        });

        // Traverse AST and extract exports
        traverse(ast, {
            ExportNamedDeclaration: (path) => {
                const { node } = path;

                if (node.declaration) {
                    const extracted = this.extractDeclaration(node.declaration, file.content);
                    if (extracted) {
                        exports[extracted.name] = extracted.metadata;
                    }
                }

                // Handle export { foo, bar }
                if (node.specifiers && node.specifiers.length > 0) {
                    for (const specifier of node.specifiers) {
                        if (specifier.exported) {
                            const exportedName = specifier.exported.type === 'Identifier'
                                ? specifier.exported.name
                                : specifier.exported.value;
                            exports[exportedName] = {
                                kind: 'reexport',
                                exportedName: exportedName
                            };
                        }
                    }
                }
            },

            ExportDefaultDeclaration: (path) => {
                const { node } = path;
                if (node.declaration) {
                    const extracted = this.extractDeclaration(node.declaration, file.content);
                    if (extracted) {
                        exports['default'] = extracted.metadata;
                    }
                }
            }
        });

        return exports;
    }

    /**
     * Extract metadata from a declaration node
     * @param {Object} node - AST node
     * @param {string} sourceCode - Original source code
     * @returns {Object|null} - {name, metadata}
     */
    extractDeclaration(node, sourceCode) {
        switch (node.type) {
            case 'FunctionDeclaration':
                return this.extractFunction(node, sourceCode);
            case 'TSInterfaceDeclaration':
                return this.extractInterface(node, sourceCode);
            case 'ClassDeclaration':
                return this.extractClass(node, sourceCode);
            case 'TSEnumDeclaration':
                return this.extractEnum(node, sourceCode);
            case 'TSTypeAliasDeclaration':
                return this.extractTypeAlias(node, sourceCode);
            case 'VariableDeclaration':
                return this.extractVariable(node, sourceCode);
            default:
                return null;
        }
    }

    /**
     * Extract function metadata
     */
    extractFunction(node, sourceCode) {
        if (!node.id) return null;

        const params = node.params.map(param => ({
            name: this.getParamName(param),
            type: this.getTypeAnnotation(param.typeAnnotation),
            required: !param.optional
        }));

        return {
            name: node.id.name,
            metadata: {
                kind: 'function',
                signature: this.getNodeSource(node, sourceCode),
                params: params,
                returns: this.getTypeAnnotation(node.returnType),
                async: node.async || false
            }
        };
    }

    /**
     * Extract interface metadata
     */
    extractInterface(node, sourceCode) {
        const properties = node.body.body.map(prop => {
            if (prop.type === 'TSPropertySignature' && prop.key) {
                const propName = prop.key.name || prop.key.value;
                const propType = this.getTypeAnnotation(prop.typeAnnotation);
                return `${propName}: ${propType}`;
            }
            return null;
        }).filter(Boolean);

        return {
            name: node.id.name,
            metadata: {
                kind: 'interface',
                signature: this.getNodeSource(node, sourceCode),
                properties: properties
            }
        };
    }

    /**
     * Extract class metadata
     */
    extractClass(node, sourceCode) {
        if (!node.id) return null;

        const methods = [];
        const properties = [];

        for (const member of node.body.body) {
            if (member.type === 'ClassMethod' && member.key) {
                const methodName = member.key.type === 'Identifier' ? member.key.name : member.key.value;
                methods.push({
                    name: methodName,
                    async: member.async || false,
                    static: member.static || false
                });
            } else if (member.type === 'ClassProperty' && member.key) {
                const propName = member.key.type === 'Identifier' ? member.key.name : member.key.value;
                properties.push({
                    name: propName,
                    type: this.getTypeAnnotation(member.typeAnnotation)
                });
            }
        }

        return {
            name: node.id.name,
            metadata: {
                kind: 'class',
                signature: this.getNodeSource(node, sourceCode),
                methods: methods,
                properties: properties
            }
        };
    }

    /**
     * Extract enum metadata
     */
    extractEnum(node, sourceCode) {
        const values = node.members.map(member => {
            if (member.id) {
                const name = member.id.name || member.id.value;
                const value = member.initializer ? this.getNodeSource(member.initializer, sourceCode) : null;
                return value ? `${name} = ${value}` : name;
            }
            return null;
        }).filter(Boolean);

        return {
            name: node.id.name,
            metadata: {
                kind: 'enum',
                signature: this.getNodeSource(node, sourceCode),
                values: values
            }
        };
    }

    /**
     * Extract type alias metadata
     */
    extractTypeAlias(node, sourceCode) {
        return {
            name: node.id.name,
            metadata: {
                kind: 'type',
                signature: this.getNodeSource(node, sourceCode),
                typeDefinition: this.getTypeAnnotation(node.typeAnnotation)
            }
        };
    }

    /**
     * Extract variable declaration (const, let, var)
     */
    extractVariable(node, sourceCode) {
        // Handle variable declarations like: export const foo = ...
        if (node.declarations && node.declarations.length > 0) {
            const decl = node.declarations[0];
            if (decl.id && decl.id.name) {
                return {
                    name: decl.id.name,
                    metadata: {
                        kind: 'variable',
                        signature: this.getNodeSource(node, sourceCode),
                        type: this.getTypeAnnotation(decl.id.typeAnnotation),
                        const: node.kind === 'const'
                    }
                };
            }
        }
        return null;
    }

    /**
     * Get parameter name from param node
     */
    getParamName(param) {
        if (param.type === 'Identifier') {
            return param.name;
        }
        if (param.type === 'AssignmentPattern' && param.left) {
            return this.getParamName(param.left);
        }
        return 'param';
    }

    /**
     * Get type annotation as string
     */
    getTypeAnnotation(typeAnnotation) {
        if (!typeAnnotation) return 'any';

        const tsType = typeAnnotation.typeAnnotation || typeAnnotation;

        if (!tsType) return 'any';

        switch (tsType.type) {
            case 'TSStringKeyword':
                return 'string';
            case 'TSNumberKeyword':
                return 'number';
            case 'TSBooleanKeyword':
                return 'boolean';
            case 'TSAnyKeyword':
                return 'any';
            case 'TSVoidKeyword':
                return 'void';
            case 'TSUndefinedKeyword':
                return 'undefined';
            case 'TSNullKeyword':
                return 'null';
            case 'TSUnknownKeyword':
                return 'unknown';
            case 'TSNeverKeyword':
                return 'never';
            case 'TSTypeReference':
                // Handle generic types like Promise<T>, Array<T>, React.ReactNode
                if (tsType.typeName) {
                    const typeName = this.getTypeName(tsType.typeName);
                    if (tsType.typeParameters && tsType.typeParameters.params) {
                        const params = tsType.typeParameters.params
                            .map(p => this.getTypeAnnotation(p))
                            .join(', ');
                        return `${typeName}<${params}>`;
                    }
                    return typeName;
                }
                return 'unknown';
            case 'TSArrayType':
                return `${this.getTypeAnnotation(tsType.elementType)}[]`;
            case 'TSUnionType':
                // Handle union types like "string | number"
                if (tsType.types && tsType.types.length > 0) {
                    return tsType.types
                        .map(t => this.getTypeAnnotation(t))
                        .join(' | ');
                }
                return 'unknown';
            case 'TSIntersectionType':
                // Handle intersection types like "A & B"
                if (tsType.types && tsType.types.length > 0) {
                    return tsType.types
                        .map(t => this.getTypeAnnotation(t))
                        .join(' & ');
                }
                return 'unknown';
            case 'TSLiteralType':
                // Handle literal types like "true" or 5
                if (tsType.literal) {
                    if (tsType.literal.type === 'StringLiteral') {
                        return `"${tsType.literal.value}"`;
                    }
                    if (tsType.literal.type === 'NumericLiteral') {
                        return String(tsType.literal.value);
                    }
                    if (tsType.literal.type === 'BooleanLiteral') {
                        return String(tsType.literal.value);
                    }
                }
                return 'unknown';
            case 'TSTupleType':
                // Handle tuple types like [string, number]
                if (tsType.elementTypes) {
                    const elements = tsType.elementTypes
                        .map(t => this.getTypeAnnotation(t))
                        .join(', ');
                    return `[${elements}]`;
                }
                return 'unknown';
            case 'TSFunctionType':
            case 'TSConstructorType':
                // For function types, just indicate it's a function
                return 'Function';
            case 'TSTypeLiteral':
                // Object literal types - just indicate it's an object
                return 'object';
            case 'TSIndexedAccessType':
                // Types like T[K]
                return 'unknown';
            case 'TSMappedType':
            case 'TSConditionalType':
                // Complex mapped/conditional types
                return 'unknown';
            case 'TSPromiseType':
            case 'TSTypeQuery':
                // Fallback for old PromiseType/TypeQuery, now handled by TSTypeReference
                return tsType.typeName?.name ? `Promise<${tsType.typeName.name}>` : 'Promise<unknown>';
            default:
                return 'unknown';
        }
    }

    /**
     * Get type name from type reference
     */
    getTypeName(typeName) {
        if (!typeName) return 'unknown';

        // Handle qualified names like React.ReactNode
        if (typeName.type === 'TSQualifiedName') {
            const left = this.getTypeName(typeName.left);
            const right = typeName.right.name || 'unknown';
            return `${left}.${right}`;
        }

        // Handle simple identifiers
        if (typeName.type === 'Identifier') {
            return typeName.name;
        }

        return typeName.name || 'unknown';
    }

    /**
     * Get source code for a node
     */
    getNodeSource(node, sourceCode) {
        if (node.start !== undefined && node.end !== undefined) {
            return sourceCode.slice(node.start, node.end).trim();
        }
        return '';
    }

    /**
     * Check if file is JavaScript/TypeScript
     */
    isJavaScriptFile(filePath) {
        return /\.(js|jsx|ts|tsx)$/.test(filePath);
    }

    /**
     * Get relative path from absolute path
     */
    getRelativePath(absolutePath) {
        // Simple implementation - can be enhanced
        const parts = absolutePath.split('/');
        const srcIndex = parts.findIndex(p => p === 'src' || p === 'lib' || p === 'generated');
        if (srcIndex >= 0) {
            return parts.slice(srcIndex).join('/');
        }
        return parts[parts.length - 1];
    }

    /**
     * Load export map from cache
     */
    loadExportMap() {
        if (!existsSync(this.exportMapFile)) {
            return {};
        }

        try {
            const data = readFileSync(this.exportMapFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn(`Failed to load export map: ${error.message}`);
            return {};
        }
    }

    /**
     * Save export map to cache
     */
    async saveExportMap(exportMap) {
        try {
            // Ensure cache directory exists
            if (!existsSync(this.cacheDir)) {
                mkdirSync(this.cacheDir, { recursive: true });
            }

            writeFileSync(this.exportMapFile, JSON.stringify(exportMap, null, 2));
            console.log(`💾 Saved export map to ${this.exportMapFile}`);
        } catch (error) {
            console.warn(`Failed to save export map: ${error.message}`);
        }
    }
}

/**
 * Create an export map builder instance
 */
export function createExportMapBuilder(cacheDir) {
    return new ExportMapBuilder(cacheDir);
}

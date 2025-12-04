/**
 * Reference Loader
 * Loads reference code files and extracts specific functions/blocks
 * for use in LLM prompts to translate to target languages
 */

import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

export class ReferenceLoader {
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.referenceDir = join(baseDir, 'reference');
        this.cache = new Map(); // Cache loaded files
    }

    /**
     * Load reference code from a reference path
     * @param {string} referencePath - Path like @reference/pricing.py::calculate_discount
     * @param {string} baseDir - Optional override for base directory
     * @returns {object} - {content, language, function, path}
     */
    loadReference(referencePath, baseDir = null) {
        const dir = baseDir || this.referenceDir;

        // Parse the reference path
        const parsed = this.parseReferencePath(referencePath);

        // Construct full file path
        const fullPath = join(dir, parsed.file);

        // Check if file exists
        if (!existsSync(fullPath)) {
            console.warn(`⚠️  Reference file not found: ${fullPath}`);
            return null;
        }

        // Load file content (with caching)
        const fileContent = this.loadFile(fullPath);

        // Detect language from extension
        const language = this.detectLanguage(parsed.file);

        // Extract specific function if specified
        let content = fileContent;
        if (parsed.function) {
            const extracted = this.extractFunction(fileContent, parsed.function, language);
            content = extracted || fileContent; // Fallback to full file if extraction fails
        }

        return {
            content,
            language,
            function: parsed.function,
            path: parsed.file,
            fullPath
        };
    }

    /**
     * Parse reference path into components
     * @param {string} referencePath - Path like @reference/pricing.py::calculate_discount
     * @returns {object} - {file, function}
     */
    parseReferencePath(referencePath) {
        // Remove @reference/ prefix
        let path = referencePath;
        if (path.startsWith('@reference/')) {
            path = path.substring(11); // Remove '@reference/'
        } else if (path.startsWith('reference/')) {
            path = path.substring(10); // Remove 'reference/'
        }

        // Split on :: to get function name
        const parts = path.split('::');
        const file = parts[0];
        const functionName = parts.length > 1 ? parts[parts.length - 1] : null;

        return {
            file,
            function: functionName
        };
    }

    /**
     * Load file content (with caching)
     * @param {string} filePath - Full path to file
     * @returns {string} - File content
     */
    loadFile(filePath) {
        // Check cache
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath);
        }

        // Load from disk
        const content = readFileSync(filePath, 'utf8');

        // Cache it
        this.cache.set(filePath, content);

        return content;
    }

    /**
     * Detect language from file extension
     * @param {string} filePath - File path
     * @returns {string} - Language name
     */
    detectLanguage(filePath) {
        const ext = extname(filePath).toLowerCase();
        const languageMap = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.sql': 'sql',
            '.go': 'go',
            '.rs': 'rust',
            '.java': 'java',
            '.rb': 'ruby',
            '.php': 'php',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.cs': 'csharp',
            '.c': 'C',
            '.cpp': 'C++'
        };

        return languageMap[ext] || 'unknown';
    }

    /**
     * Extract specific function from file content
     * @param {string} content - File content
     * @param {string} functionName - Function name to extract
     * @param {string} language - Programming language
     * @returns {string|null} - Extracted function or null
     */
    extractFunction(content, functionName, language) {
        switch (language) {
            case 'python':
                return this.extractPythonFunction(content, functionName);
            case 'javascript':
            case 'typescript':
                return this.extractJSFunction(content, functionName);
            case 'sql':
                return this.extractSQLFunction(content, functionName);
            default:
                // For unknown languages, return full content
                console.warn(`⚠️  Function extraction not supported for ${language}`);
                return null;
        }
    }

    /**
     * Extract Python function
     * @param {string} content - File content
     * @param {string} functionName - Function name
     * @returns {string|null} - Extracted function
     */
    extractPythonFunction(content, functionName) {
        const lines = content.split('\n');
        const functionPattern = new RegExp(`^(def|async def)\\s+${functionName}\\s*\\(`);

        let startLine = -1;
        let endLine = -1;
        let baseIndent = 0;

        // Find function start
        for (let i = 0; i < lines.length; i++) {
            if (functionPattern.test(lines[i].trim())) {
                startLine = i;
                baseIndent = lines[i].length - lines[i].trimStart().length;
                break;
            }
        }

        if (startLine === -1) {
            return null; // Function not found
        }

        // Find function end (next line with same or lower indentation that's not blank)
        for (let i = startLine + 1; i < lines.length; i++) {
            const line = lines[i];

            // Skip empty lines and comments
            if (line.trim() === '' || line.trim().startsWith('#')) {
                continue;
            }

            const indent = line.length - line.trimStart().length;

            // If we hit a line with same or lower indentation, function ends
            if (indent <= baseIndent) {
                endLine = i - 1;
                break;
            }
        }

        // If we didn't find an end, go to end of file
        if (endLine === -1) {
            endLine = lines.length - 1;
        }

        return lines.slice(startLine, endLine + 1).join('\n');
    }

    /**
     * Extract JavaScript/TypeScript function
     * @param {string} content - File content
     * @param {string} functionName - Function name
     * @returns {string|null} - Extracted function
     */
    extractJSFunction(content, functionName) {
        const lines = content.split('\n');

        // Patterns for function declarations
        const patterns = [
            new RegExp(`^(export\\s+)?(async\\s+)?function\\s+${functionName}\\s*\\(`),
            new RegExp(`^(export\\s+)?const\\s+${functionName}\\s*=\\s*(async\\s+)?\\(`),
            new RegExp(`^(export\\s+)?const\\s+${functionName}\\s*=\\s*(async\\s+)?function`),
            new RegExp(`^\\s*${functionName}\\s*:\\s*(async\\s+)?function`)
        ];

        let startLine = -1;
        let braceCount = 0;
        let inFunction = false;

        // Find function start
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (patterns.some(p => p.test(line))) {
                startLine = i;
                inFunction = true;

                // Count braces on this line
                for (const char of line) {
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                }

                break;
            }
        }

        if (startLine === -1) {
            return null;
        }

        // Find function end by matching braces
        for (let i = startLine + 1; i < lines.length; i++) {
            const line = lines[i];

            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;

                if (braceCount === 0 && inFunction) {
                    return lines.slice(startLine, i + 1).join('\n');
                }
            }
        }

        return null;
    }

    /**
     * Extract SQL function/procedure
     * @param {string} content - File content
     * @param {string} functionName - Function name
     * @returns {string|null} - Extracted function
     */
    extractSQLFunction(content, functionName) {
        // SQL functions often have CREATE FUNCTION or CREATE PROCEDURE
        const pattern = new RegExp(
            `CREATE\\s+(OR\\s+REPLACE\\s+)?(FUNCTION|PROCEDURE)\\s+${functionName}`,
            'i'
        );

        const lines = content.split('\n');
        let startLine = -1;

        // Find start
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                startLine = i;
                break;
            }
        }

        if (startLine === -1) {
            return null;
        }

        // Find end (look for semicolon or END; or $$ or similar)
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.endsWith(';') || line.match(/END\s*;/i) || line === '$$') {
                return lines.slice(startLine, i + 1).join('\n');
            }
        }

        return null;
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

/**
 * Factory function to create ReferenceLoader
 * @param {string} baseDir - Base directory
 * @returns {ReferenceLoader} - ReferenceLoader instance
 */
export function createReferenceLoader(baseDir) {
    return new ReferenceLoader(baseDir);
}

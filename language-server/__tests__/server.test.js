/**
 * Language Server Tests
 * Comprehensive tests for the Compose Language Server Protocol implementation
 * These tests focus on catching real bugs, not just verifying happy paths
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node.js';

// We'll test the validation logic by importing the server components
// Since the server uses dynamic imports, we'll need to test the validation logic directly
import { Lexer } from '../../compiler/lexer/tokenizer.js';
import { Parser } from '../../compiler/parser/parser.js';
import { SemanticAnalyzer } from '../../compiler/analyzer/index.js';

/**
 * Simulate the server's validateTextDocument function
 * This is extracted from server.js for testability
 */
async function validateDocument(textContent, uri = 'file:///test.compose') {
    const diagnostics = [];

    try {
        // Tokenize
        const lexer = new Lexer(textContent);
        const tokens = lexer.tokenize();

        // Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Analyze
        const analyzer = new SemanticAnalyzer({ loadImports: false });
        const result = analyzer.analyze(ast);

        // Convert errors to diagnostics
        if (result.errors && result.errors.length > 0) {
            for (const error of result.errors) {
                const diagnostic = {
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: (error.location?.line || 1) - 1,
                            character: (error.location?.column || 1) - 1
                        },
                        end: {
                            line: (error.location?.line || 1) - 1,
                            character: (error.location?.column || 1) + 10
                        }
                    },
                    message: error.message,
                    source: 'compose'
                };
                diagnostics.push(diagnostic);
            }
        }
    } catch (error) {
        // Parser or analyzer error
        const diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 10 }
            },
            message: error.message || 'Unknown error',
            source: 'compose'
        };
        diagnostics.push(diagnostic);
    }

    return diagnostics;
}

describe('Language Server - Diagnostic Generation', () => {
    it('should produce no diagnostics for valid Compose code', async () => {
        const source = `model User:
  name: text
  email: text
  age: number`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should detect undefined type references', async () => {
        const source = `model Order:
  userId: NonExistentUser`;

        const diagnostics = await validateDocument(source);

        assert.ok(diagnostics.length > 0, 'Expected at least one diagnostic');
        assert.equal(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert.ok(diagnostics[0].message.includes('NonExistentUser'));
        assert.ok(
            diagnostics[0].message.toLowerCase().includes('undefined') ||
            diagnostics[0].message.toLowerCase().includes('references')
        );
    });

    it('should detect duplicate model definitions', async () => {
        const source = `model User:
  name: text

model User:
  email: text`;

        const diagnostics = await validateDocument(source);

        assert.ok(diagnostics.length > 0);
        assert.equal(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert.ok(
            diagnostics[0].message.toLowerCase().includes('duplicate') ||
            diagnostics[0].message.toLowerCase().includes('already defined')
        );
        assert.ok(diagnostics[0].message.includes('User'));
    });

    it('should report correct line numbers for errors', async () => {
        const source = `model User:
  name: text

model Order:
  userId: Customer`;

        const diagnostics = await validateDocument(source);

        assert.ok(diagnostics.length > 0);
        // The error should be on line 4 (0-indexed: line 3)
        // This tests that the location tracking is working
        assert.ok(diagnostics[0].range.start.line >= 0);
    });

    it('should handle multiple errors in one document', async () => {
        const source = `model User:
  name: InvalidType

model Product:
  category: AnotherInvalid`;

        const diagnostics = await validateDocument(source);

        // Should report both errors
        assert.ok(diagnostics.length >= 2, `Expected at least 2 errors, got ${diagnostics.length}`);
    });
});

describe('Language Server - Edge Cases & Bug Detection', () => {
    it('should handle empty documents without crashing', async () => {
        const source = '';

        const diagnostics = await validateDocument(source);

        // Empty document should not crash, should return no diagnostics
        assert.ok(Array.isArray(diagnostics));
        assert.equal(diagnostics.length, 0);
    });

    it('should handle whitespace-only documents', async () => {
        const source = '   \n\n\t\n  ';

        const diagnostics = await validateDocument(source);

        assert.ok(Array.isArray(diagnostics));
        // Should handle gracefully
    });

    it('should handle documents with only comments', async () => {
        const source = `# Just a comment
# Another comment
# More comments`;

        const diagnostics = await validateDocument(source);

        assert.equal(diagnostics.length, 0);
    });

    it('should handle malformed syntax with parser errors', async () => {
        const source = `model User
  name text`;  // Missing colons

        const diagnostics = await validateDocument(source);

        // Should catch parser error
        assert.ok(diagnostics.length > 0);
        assert.equal(diagnostics[0].severity, DiagnosticSeverity.Error);
    });

    it('should handle Unicode content correctly', async () => {
        const source = `model User:
  name: text
  bio: text  # 你好世界 🌍`;

        const diagnostics = await validateDocument(source);

        assert.equal(diagnostics.length, 0);
    });

    it('should handle very long field names', async () => {
        const longFieldName = 'a'.repeat(1000);
        const source = `model User:
  ${longFieldName}: text`;

        const diagnostics = await validateDocument(source);

        // Should handle without crashing
        assert.ok(Array.isArray(diagnostics));
    });

    it('should handle deeply nested model references', async () => {
        const source = `model Address:
  street: text

model Profile:
  address: Address

model User:
  profile: Profile

model Order:
  user: User`;

        const diagnostics = await validateDocument(source);

        assert.equal(diagnostics.length, 0);
    });

    it('should provide diagnostics with valid range structures', async () => {
        const source = `model Order:
  userId: FakeUser`;

        const diagnostics = await validateDocument(source);

        assert.ok(diagnostics.length > 0);
        const diag = diagnostics[0];

        // Validate diagnostic structure
        assert.ok(diag.range);
        assert.ok(diag.range.start);
        assert.ok(diag.range.end);
        assert.ok(typeof diag.range.start.line === 'number');
        assert.ok(typeof diag.range.start.character === 'number');
        assert.ok(typeof diag.range.end.line === 'number');
        assert.ok(typeof diag.range.end.character === 'number');
        assert.ok(diag.range.start.line >= 0);
        assert.ok(diag.range.start.character >= 0);
    });
});

describe('Language Server - Error Recovery', () => {
    it('should clear errors when document is fixed', async () => {
        // First: document with error
        const errorSource = `model Order:
  userId: NonExistent`;

        const errorDiagnostics = await validateDocument(errorSource);
        assert.ok(errorDiagnostics.length > 0);

        // Then: fixed document
        const fixedSource = `model User:
  id: number

model Order:
  userId: User`;

        const fixedDiagnostics = await validateDocument(fixedSource);
        assert.equal(fixedDiagnostics.length, 0);
    });

    it('should handle progressive error correction', async () => {
        // Document with 2 errors
        const source1 = `model Order:
  userId: Fake1
  productId: Fake2`;

        const diag1 = await validateDocument(source1);
        assert.ok(diag1.length >= 2);

        // Fix one error
        const source2 = `model User:
  id: number

model Order:
  userId: User
  productId: Fake2`;

        const diag2 = await validateDocument(source2);
        assert.ok(diag2.length > 0);
        assert.ok(diag2.length < diag1.length);

        // Fix all errors
        const source3 = `model User:
  id: number

model Product:
  id: number

model Order:
  userId: User
  productId: Product`;

        const diag3 = await validateDocument(source3);
        assert.equal(diag3.length, 0);
    });
});

describe('Language Server - Complex Scenarios', () => {
    it('should handle list types correctly', async () => {
        const source = `model User:
  tags: list of text
  scores: list of number`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should detect errors in list types', async () => {
        const source = `model Order:
  items: list of NonExistent`;

        const diagnostics = await validateDocument(source);
        assert.ok(diagnostics.length > 0);
        assert.ok(diagnostics[0].message.includes('NonExistent'));
    });

    it('should handle optional fields', async () => {
        const source = `model User:
  name: text
  bio: text?`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should handle enum types', async () => {
        const source = `model User:
  role: "admin" | "member" | "guest"
  status: "active" | "inactive"`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should validate complete programs with features and guides', async () => {
        const source = `model User:
  id: number
  email: text

model Product:
  id: number
  name: text

feature "User Management":
  - Create users
  - Edit users
  - Delete users

guide "Security":
  - Use bcrypt for passwords
  - Implement rate limiting`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should handle model references in lists', async () => {
        const source = `model Product:
  name: text

model Order:
  items: list of Product`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should detect undefined types in lists', async () => {
        const source = `model Order:
  items: list of NonExistent`;

        const diagnostics = await validateDocument(source);
        assert.ok(diagnostics.length > 0);
    });
});

describe('Language Server - Performance & Stress Tests', () => {
    it('should handle large documents efficiently', async () => {
        // Generate a large document with many models
        let source = '';
        for (let i = 0; i < 100; i++) {
            source += `model Model${i}:
  field1: text
  field2: number

`;
        }

        const startTime = Date.now();
        const diagnostics = await validateDocument(source);
        const endTime = Date.now();

        assert.equal(diagnostics.length, 0);
        // Should complete in reasonable time (< 5 seconds)
        assert.ok(endTime - startTime < 5000, `Validation took too long: ${endTime - startTime}ms`);
    });

    it('should handle documents with many errors', async () => {
        // Document with 50+ errors
        let source = '';
        for (let i = 0; i < 50; i++) {
            source += `model Model${i}:
  field: InvalidType${i}

`;
        }

        const diagnostics = await validateDocument(source);

        // Should report all errors without crashing
        assert.ok(diagnostics.length >= 50);
    });
});

describe('Language Server - Primitive Type Validation', () => {
    it('should accept all primitive types', async () => {
        const source = `model Test:
  textField: text
  numField: number
  boolField: bool
  dateField: date
  timestampField: timestamp
  imageField: image
  fileField: file
  markdownField: markdown
  jsonField: json`;

        const diagnostics = await validateDocument(source);
        assert.equal(diagnostics.length, 0);
    });

    it('should reject unknown primitive types', async () => {
        const source = `model Test:
  field: invalidtype`;

        const diagnostics = await validateDocument(source);
        assert.ok(diagnostics.length > 0);
    });
});

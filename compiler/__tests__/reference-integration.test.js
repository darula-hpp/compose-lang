/**
 * Integration test for @reference feature
 * Tests end-to-end flow: .compose file → IR → prompt with reference code
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Lexer } from '../lexer/tokenizer.js';
import { Parser } from '../parser/parser.js';
import { buildIR } from '../ir/ir-builder.js';
import { createFullProjectPrompt } from '../emitter/prompt-templates.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('Integration - @reference Feature', () => {
    let testDir;
    let referenceDir;

    beforeEach(() => {
        testDir = join(process.cwd(), '__test_reference_integration__');
        referenceDir = join(testDir, 'reference');

        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }

        mkdirSync(referenceDir, { recursive: true });
    });

    afterEach(() => {
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('should generate complete prompt with reference code', () => {
        // Create a reference Python file
        const pricingCode = `def calculate_discount(amount, years):
    if years >= 5:
        return amount * 0.15
    elif years >= 3:
        return amount * 0.10
    else:
        return 0`;

        writeFileSync(join(referenceDir, 'pricing.py'), pricingCode);

        // Create a .compose file that references it
        const composeCode = `model Order:
  total: number

guide "Pricing Logic":
  - @reference/pricing.py::calculate_discount
  - Translate to target language
  - Preserve exact percentage thresholds`;

        // Parse the .compose file
        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Build IR (this should load the reference)
        const ir = buildIR(ast, testDir);

        // Verify the reference was loaded
        assert.equal(ir.guides.length, 1);
        const guide = ir.guides[0];
        assert.equal(guide.name, 'Pricing Logic');
        assert.ok(guide.references);
        assert.equal(guide.references.length, 1);

        const ref = guide.references[0];
        assert.equal(ref.language, 'python');
        assert.equal(ref.function, 'calculate_discount');
        assert.equal(ref.path, 'pricing.py');
        assert.ok(ref.content.includes('def calculate_discount'));
        assert.ok(ref.content.includes('return amount * 0.15'));

        // Generate prompt and verify reference is included
        const target = {
            language: 'typescript',
            framework: 'react',
            output: './generated'
        };

        const prompt = createFullProjectPrompt(ir, target);

        // Verify prompt contains reference code
        assert.ok(prompt.includes('Reference Implementations'));
        assert.ok(prompt.includes('pricing.py::calculate_discount'));
        assert.ok(prompt.includes('def calculate_discount'));
        assert.ok(prompt.includes('Translate this python code to the target language'));
    });

    it('should handle multiple references in same guide', () => {
        // Create two reference files
        writeFileSync(join(referenceDir, 'pricing.py'), 'def calculate(): pass');
        writeFileSync(join(referenceDir, 'validation.js'), 'function validate() {}');

        const composeCode = `guide "Implementation":
  - @reference/pricing.py
  - @reference/validation.js
  - Combine these approaches`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        // Should have loaded both references
        assert.equal(ir.guides[0].references.length, 2);

        const langs = ir.guides[0].references.map(r => r.language).sort();
        assert.deepEqual(langs, ['javascript', 'python']);
    });

    it('should handle missing reference files gracefully', () => {
        const composeCode = `guide "Test":
  - @reference/nonexistent.py
  - Continue anyway`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        // Should still create guide but with no references
        assert.equal(ir.guides.length, 1);
        assert.ok(!ir.guides[0].references || ir.guides[0].references.length === 0);
    });

    it('should extract only specific function when specified', () => {
        const fullFile = `def function_one():
    return 1

def function_two():
    return 2

def function_three():
    return 3`;

        writeFileSync(join(referenceDir, 'multi.py'), fullFile);

        const composeCode = `guide "Extract Function":
  - @reference/multi.py::function_two
  - Should only get function_two`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        const ref = ir.guides[0].references[0];
        assert.ok(ref.content.includes('def function_two'));
        assert.ok(!ref.content.includes('def function_one'));
        assert.ok(!ref.content.includes('def function_three'));
    });

    it('should load entire file when no function specified', () => {
        const fullFile = `def func_a(): pass\ndef func_b(): pass`;
        writeFileSync(join(referenceDir, 'all.py'), fullFile);

        const composeCode = `guide "Full File":
  - @reference/all.py
  - Use entire file`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        const ref = ir.guides[0].references[0];
        assert.ok(ref.content.includes('def func_a'));
        assert.ok(ref.content.includes('def func_b'));
    });
});

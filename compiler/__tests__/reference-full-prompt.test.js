/**
 * Comprehensive Integration tests for @reference feature
 * Tests full prompt generation with all components
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Lexer } from '../lexer/tokenizer.js';
import { Parser } from '../parser/parser.js';
import { buildIR } from '../ir/ir-builder.js';
import { createFullProjectPrompt } from '../emitter/prompt-templates.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('Integration - @reference Full Prompt Generation', () => {
    let testDir;
    let referenceDir;

    beforeEach(() => {
        testDir = join(process.cwd(), '__test_ref_full_prompt__');
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

    it('should generate prompt with models, features, and references together', () => {
        // Create reference file
        const validationCode = `function validateEmail(email) {
    const pattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return pattern.test(email);
}`;

        writeFileSync(join(referenceDir, 'validation.js'), validationCode);

        // Complete .compose file with all constructs
        const composeCode = `model User:
  email: text
  name: text
  role: "admin" | "member"

feature "Authentication":
  - Email/password login
  - Role-based access control

guide "Email Validation":
  - @reference/validation.js::validateEmail
  - Use this exact validation pattern
  - Add additional corporate domain check`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        const target = {
            language: 'typescript',
            framework: 'nextjs',
            output: './src'
        };

        const prompt = createFullProjectPrompt(ir, target);

        // Verify all sections are present
        assert.ok(prompt.includes('Target Stack'));
        assert.ok(prompt.includes('typescript'));
        assert.ok(prompt.includes('nextjs'));

        // Verify model is included
        assert.ok(prompt.includes('User:'));
        assert.ok(prompt.includes('email: text'));
        assert.ok(prompt.includes('"admin" | "member"'));

        // Verify feature is included
        assert.ok(prompt.includes('Authentication'));
        assert.ok(prompt.includes('Email/password login'));

        // Verify guide with reference
        assert.ok(prompt.includes('Email Validation'));
        assert.ok(prompt.includes('validation.js::validateEmail'));
        assert.ok(prompt.includes('function validateEmail'));
        assert.ok(prompt.includes('Use this exact validation pattern'));

        // Verify generation instructions
        assert.ok(prompt.includes('Generate complete, working code'));
    });

    it('should include multiple references with proper formatting', () => {
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

        const target = { language: 'typescript', framework: 'react', output: './' };
        const prompt = createFullProjectPrompt(ir, target);

        // Both should appear with proper language tags
        assert.ok(prompt.includes('```python'));
        assert.ok(prompt.includes('```javascript'));
        assert.ok(prompt.includes('pricing.py'));
        assert.ok(prompt.includes('validation.js'));
        assert.ok(prompt.includes('def calculate'));
        assert.ok(prompt.includes('function validate'));
    });

    it('should handle SQL references with correct formatting', () => {
        const sqlQuery = `SELECT u.id, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = 1
GROUP BY u.id, u.email
HAVING COUNT(o.id) > 0;`;

        mkdirSync(join(referenceDir, 'queries'), { recursive: true });
        writeFileSync(join(referenceDir, 'queries/reports.sql'), sqlQuery);

        const composeCode = `guide "Database Query":
  - @reference/queries/reports.sql
  - Adapt to target database and ORM`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        const target = { language: 'python', framework: 'django', output: './' };
        const prompt = createFullProjectPrompt(ir, target);

        // Verify SQL is properly tagged and formatted
        assert.ok(prompt.includes('```sql'));
        assert.ok(prompt.includes('SELECT u.id'));
        assert.ok(prompt.includes('GROUP BY'));
        assert.ok(prompt.includes('Translate this sql code'));
        assert.ok(prompt.includes('queries/reports.sql'));
    });

    it('should work with complex real-world ecommerce scenario', () => {
        // Realistic business logic
        const discountLogic = `def calculate_loyalty_discount(amount, customer):
    """
    Calculate loyalty discount based on membership duration.
    Business rules approved by CEO on 2024-01-15.
    """
    years = customer.years_member
    
    if years >= 10:
        return amount * 0.20  # 20% for 10+ years
    elif years >= 5:
        return amount * 0.15  # 15% for 5-9 years
    elif years >= 3:
        return amount * 0.10  # 10% for 3-4 years
    elif years >= 1:
        return amount * 0.05  # 5% for 1-2 years
    else:
        return 0  # No discount for new members`;

        mkdirSync(join(referenceDir, 'business'), { recursive: true });
        writeFileSync(join(referenceDir, 'business/pricing.py'), discountLogic);

        const composeCode = `model Customer:
  id: number
  email: text
  years_member: number

model Order:
  id: number
  customer: Customer
  subtotal: number
  discount: number
  total: number

feature "Loyalty Program":
  - Calculate discounts based on membership duration
  - Apply to eligible orders
  - Track discount history

guide "Discount Calculation":
  - @reference/business/pricing.py::calculate_loyalty_discount
  - Translate to target language
  - Preserve exact percentage thresholds from CEO approval
  - Add logging for audit trail
  - Ensure thread-safe implementation`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        const target = {
            language: 'typescript',
            framework: 'nextjs',
            output: './src',
            dependencies: ['prisma', '@auth/next']
        };

        const prompt = createFullProjectPrompt(ir, target);

        // Comprehensive verification
        assert.ok(prompt.includes('Target Stack'));
        assert.ok(prompt.includes('nextjs'));
        assert.ok(prompt.includes('typescript'));

        // Dependencies
        assert.ok(prompt.includes('prisma'));
        assert.ok(prompt.includes('@auth/next'));

        // Models with relationships
        assert.ok(prompt.includes('Customer:'));
        assert.ok(prompt.includes('Order:'));
        assert.ok(prompt.includes('customer: Customer'));
        assert.ok(prompt.includes('years_member: number'));

        // Feature
        assert.ok(prompt.includes('Loyalty Program'));
        assert.ok(prompt.includes('Calculate discounts based on membership duration'));

        // Reference code with docstring and comments
        assert.ok(prompt.includes('business/pricing.py::calculate_loyalty_discount'));
        assert.ok(prompt.includes('```python'));
        assert.ok(prompt.includes('def calculate_loyalty_discount'));
        assert.ok(prompt.includes('Business rules approved by CEO'));
        assert.ok(prompt.includes('20% for 10+ years'));
        assert.ok(prompt.includes('No discount for new members'));

        // Translation instructions
        assert.ok(prompt.includes('Translate this python code to the target language'));
        assert.ok(prompt.includes('Preserve the exact logic and business rules'));

        // Additional guide bullets
        assert.ok(prompt.includes('Preserve exact percentage thresholds'));
        assert.ok(prompt.includes('Add logging for audit trail'));

        // Generation instructions
        assert.ok(prompt.includes('Generate complete, working code'));
        assert.ok(prompt.includes('Production-ready'));
        assert.ok(prompt.includes('Follow best practices'));

        // Output format instructions
        assert.ok(prompt.includes('### FILE:'));
        assert.ok(prompt.includes('Do NOT include markdown code fences'));
    });

    it('should verify prompt structure has proper sections in order', () => {
        const composeCode = `model Product:
  name: text
  price: number

feature "Catalog":
  - Display products

guide "Pricing":
  - Standard pricing logic`;

        const lexer = new Lexer(composeCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const ir = buildIR(ast, testDir);

        const target = {
            language: 'typescript',
            framework: 'react',
            output: './src',
            dependencies: ['react', 'react-dom'],
            extraRules: ['Use functional components', 'Add TypeScript strict mode']
        };

        const prompt = createFullProjectPrompt(ir, target);

        // Verify section order and structure
        const targetIdx = prompt.indexOf('Target Stack');
        const depsIdx = prompt.indexOf('Required Dependencies');
        const modelsIdx = prompt.indexOf('Data Models');
        const featuresIdx = prompt.indexOf('Application Features');
        const guidesIdx = prompt.indexOf('Implementation Guidelines');
        const extraIdx = prompt.indexOf('Additional Requirements');
        const genIdx = prompt.indexOf('Generation Requirements');

        // All sections should exist
        assert.ok(targetIdx > 0);
        assert.ok(depsIdx > 0);
        assert.ok(modelsIdx > 0);
        assert.ok(featuresIdx > 0);
        assert.ok(guidesIdx > 0);
        assert.ok(extraIdx > 0);
        assert.ok(genIdx > 0);

        // Sections should be in logical order
        assert.ok(targetIdx < depsIdx);
        assert.ok(depsIdx < modelsIdx);
        assert.ok(modelsIdx < featuresIdx);
        assert.ok(featuresIdx < guidesIdx);
        assert.ok(guidesIdx < extraIdx);
        assert.ok(extraIdx < genIdx);

        // Verify specific content
        assert.ok(prompt.includes('react'));
        assert.ok(prompt.includes('react-dom'));
        assert.ok(prompt.includes('Use functional components'));
        assert.ok(prompt.includes('TypeScript strict mode'));
    });
});

/**
 * Integration Tests
 * Verifies the full compiler pipeline: Source -> AST -> Analyzer -> IR -> Prompt
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { compile } from '../index.js';
import { createFullProjectPrompt } from '../emitter/prompt-templates.js';
import { loadComposeConfig } from '../emitter/compose-config.js';
import path from 'path';

describe('Compiler Integration', () => {
    it('should compile a complete project source to a valid LLM prompt', () => {
        // 1. Source Code (v0.2.0 Syntax)
        const source = `
# E-commerce Project Definition

model User:
  id: number
  email: text
  role: "admin" | "customer"
  profile: Profile?

model Profile:
  bio: text
  avatar: image

feature "User Authentication":
  - Sign up with email/password
  - Login and Logout
  - Password reset flow

guide "Security Best Practices":
  - Use bcrypt for password hashing
  - Implement rate limiting on login endpoints
`;

        // 2. Compile (Lex -> Parse -> Analyze -> IR)
        const result = compile(source, 'integration-test.compose');

        // 3. Verify Compilation Success
        if (!result.success) {
            console.error('Compilation failed:', JSON.stringify(result.errors, null, 2));
        }
        assert.equal(result.success, true);
        assert.equal(result.errors.length, 0);

        // 4. Verify AST
        assert.ok(result.ast);
        assert.equal(result.ast.models.length, 2);
        assert.equal(result.ast.features.length, 1);
        assert.equal(result.ast.guides.length, 1);

        // 5. Verify Symbol Table (Analysis)
        assert.ok(result.symbolTable);
        assert.ok(result.symbolTable.lookupType('User'));
        assert.ok(result.symbolTable.lookupType('Profile'));

        // 6. Verify IR Generation
        assert.ok(result.ir);
        assert.equal(result.ir.models.length, 2);
        assert.equal(result.ir.features.length, 1);
        assert.equal(result.ir.guides.length, 1);

        // Verify IR content
        const userModel = result.ir.models.find(m => m.name === 'User');
        assert.ok(userModel);
        assert.equal(userModel.fields.length, 4);

        const authFeature = result.ir.features[0];
        assert.equal(authFeature.name, 'User Authentication');
        assert.equal(authFeature.description.length, 3);

        // 7. Verify Prompt Generation (Emitter)
        const targetConfig = {
            language: 'typescript',
            framework: 'nextjs',
            database: 'postgresql'
        };

        const prompt = createFullProjectPrompt(result.ir, targetConfig);

        // Check for key components in the prompt
        assert.ok(prompt.includes('User Authentication'));
        assert.ok(prompt.includes('Sign up with email / password'));
        assert.ok(prompt.includes('Security Best Practices'));
        assert.ok(prompt.includes('bcrypt'));

        // Check for model definitions in prompt
        assert.ok(prompt.includes('User'));
        assert.ok(prompt.includes('email: text'));
        assert.ok(prompt.includes('role: "admin" | "customer"'));
    });

    it('should handle compilation errors gracefully', () => {
        const invalidSource = `
model User:
  name: UnknownType  # Undefined type
`;

        const result = compile(invalidSource, 'error-test.compose');

        assert.equal(result.success, false);
        assert.ok(result.errors.length > 0);
        assert.ok(result.errors[0].message.includes('undefined type'));
        assert.ok(result.errors[0].message.includes('UnknownType'));
    });

    it('should load and validate a real compose.json config', () => {
        const configPath = path.resolve(process.cwd(), 'examples/todo-simple/compose.json');
        const config = loadComposeConfig(configPath);

        assert.ok(config.llm);
        assert.equal(config.llm.provider, 'gemini');
        assert.ok(config.targets);
        assert.ok(config.targets.web);
        assert.equal(config.targets.web.language, 'typescript');
        assert.equal(config.targets.web.framework, 'nextjs');
    });
});

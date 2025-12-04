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

describe('Compiler Integration - With Imports', () => {
  it('should compile a multi-file project with imports', () => {
    // Test that import statements are parsed correctly
    // We skip analysis because User type isn't defined without loading imports
    const source = `import "shared/types.compose"

model Order:
  userId: User
  total: number

feature "Orders":
  - Create new orders
  - Calculate totals`;

    const result = compile(source, 'orders.compose', { loadImports: false, skipAnalysis: true });

    // Should parse successfully even with imports
    assert.equal(result.success, true);
    assert.ok(result.ast);

    // Verify import is in AST
    assert.ok(result.ast.imports);
    assert.equal(result.ast.imports.length, 1);
    assert.equal(result.ast.imports[0].path, 'shared/types.compose');
  });

  it('should handle model references across files conceptually', () => {
    // When both models are in the same file, references work
    const source = `model User:
  id: number
  profile: Profile

model Profile:
  bio: text
  userId: User`;

    const result = compile(source, 'test.compose');

    assert.equal(result.success, true);

    // Both models should be in the symbol table
    assert.ok(result.symbolTable.lookupType('User'));
    assert.ok(result.symbolTable.lookupType('Profile'));
  });

  it('should generate correct IR for projects with imports', () => {
    const source = `import "models/user.compose"

feature "User Dashboard":
  - Display user information
  - Show user statistics
  
guide "Performance":
  - Cache user data for 5 minutes
  - Use database indexes`;

    const result = compile(source, 'dashboard.compose', { loadImports: false });

    assert.equal(result.success, true);
    assert.ok(result.ir);
    assert.equal(result.ir.features.length, 1);
    assert.equal(result.ir.guides.length, 1);
  });

  it('should include import information in compilation results', () => {
    const source = `import "shared/models.compose"
import "shared/validators.compose"

model NewModel:
  id: number`;

    const result = compile(source, 'new.compose', { loadImports: false, skipAnalysis: true });

    assert.equal(result.success, true);

    // Should have import statements recorded in AST
    assert.ok(result.ast.imports);
    assert.equal(result.ast.imports.length, 2);
  });

  it('should compile complete multi-file project structure', () => {
    // Simulate a main file that would import other modules
    // Skip analysis since referenced types (User, Product) aren't defined
    const mainSource = `import "models/user.compose"
import "models/product.compose"
import "features/auth.compose"

model Order:
  id: number
  userId: User
  items: list of Product
  status: "pending" | "completed"

feature "Order Management":
  - Create orders from cart
  - Track order status
  - Calculate order totals

guide "Order Processing":
  - Validate inventory before order creation
  - Send confirmation emails
  - Update product stock atomically`;

    const result = compile(mainSource, 'main.compose', { loadImports: false, skipAnalysis: true });

    assert.equal(result.success, true);
    assert.ok(result.ast);

    // Verify imports were parsed
    assert.equal(result.ast.imports.length, 3);

    // Verify the Order model was parsed
    assert.equal(result.ast.models.length, 1);
    assert.equal(result.ast.models[0].name, 'Order');

    // Verify features and guides were parsed
    assert.equal(result.ast.features.length, 1);
    assert.equal(result.ast.guides.length, 1);
  });
});

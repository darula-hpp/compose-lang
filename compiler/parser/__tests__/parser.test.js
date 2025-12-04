/**
 * Parser Tests
 * Comprehensive tests for parsing v0.2.0 syntax (model, feature, guide)
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Parser } from '../parser.js';
import { Lexer } from '../../lexer/tokenizer.js';

/**
 * Helper function to parse Compose code
 */
function parse(input) {
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
}

describe('Parser - Model Declarations', () => {
    it('should parse a simple model', () => {
        const input = `model User:
  name: text
  age: number`;

        const ast = parse(input);

        assert.equal(ast.models.length, 1);
        assert.equal(ast.models[0].name, 'User');
        assert.equal(ast.models[0].fields.length, 2);
        assert.equal(ast.models[0].fields[0].name, 'name');
        assert.equal(ast.models[0].fields[0].fieldType.baseType, 'text');
    });

    it('should parse model with all primitive types', () => {
        const input = `model Test:
  text: text
  num: number
  flag: bool
  birthday: date
  created: timestamp
  avatar: image
  doc: file
  bio: markdown
  data: json`;

        const ast = parse(input);

        assert.equal(ast.models[0].fields.length, 9);
    });

    it('should parse optional fields', () => {
        const input = `model User:
  name: text
  bio: text?`;

        const ast = parse(input);

        assert.equal(ast.models[0].fields[0].optional, false);
        assert.equal(ast.models[0].fields[1].optional, true);
    });

    it('should parse list types', () => {
        const input = `model User:
  tags: list of text
  scores: list of number`;

        const ast = parse(input);

        assert.equal(ast.models[0].fields[0].fieldType.isArray, true);
        assert.equal(ast.models[0].fields[0].fieldType.baseType, 'text');
        assert.equal(ast.models[0].fields[1].fieldType.isArray, true);
        assert.equal(ast.models[0].fields[1].fieldType.baseType, 'number');
    });

    it('should parse enum types', () => {
        const input = `model User:
  role: "admin" | "member" | "guest"
  status: "pending" | "approved"`;

        const ast = parse(input);

        const roleField = ast.models[0].fields[0];
        assert.ok(roleField.fieldType.enumValues);
        assert.equal(roleField.fieldType.enumValues.length, 3);
        assert.deepEqual(roleField.fieldType.enumValues, ['admin', 'member', 'guest']);
    });

    it('should parse model references', () => {
        const input = `model Order:
  userId: User
  items: list of Product`;

        const ast = parse(input);

        assert.equal(ast.models[0].fields[0].fieldType.baseType, 'User');
        assert.equal(ast.models[0].fields[1].fieldType.baseType, 'Product');
        assert.equal(ast.models[0].fields[1].fieldType.isArray, true);
    });

    it('should parse multiple models', () => {
        const input = `model User:
  name: text

model Product:
  title: text
  price: number`;

        const ast = parse(input);

        assert.equal(ast.models.length, 2);
        assert.equal(ast.models[0].name, 'User');
        assert.equal(ast.models[1].name, 'Product');
    });
});

describe('Parser - Feature Declarations', () => {
    it('should parse a simple feature', () => {
        const input = `feature "User Management":
  - Create new users
  - Edit user profiles
  - Delete users`;

        const ast = parse(input);

        assert.equal(ast.features.length, 1);
        assert.equal(ast.features[0].name, 'User Management');
        assert.equal(ast.features[0].items.length, 3);
        assert.equal(ast.features[0].items[0], 'Create new users');
    });

    it('should parse feature with single item', () => {
        const input = `feature "Authentication":
  - Login with email/password`;

        const ast = parse(input);

        assert.equal(ast.features[0].items.length, 1);
    });

    it('should parse multiple features', () => {
        const input = `feature "Auth":
  - Login
  - Logout

feature "Products":
  - List products
  - Search products`;

        const ast = parse(input);

        assert.equal(ast.features.length, 2);
        assert.equal(ast.features[0].name, 'Auth');
        assert.equal(ast.features[1].name, 'Products');
    });

    it('should handle complex feature descriptions', () => {
        const input = `feature "Advanced Search":
  - Full-text search with ElasticSearch
  - Filter by price range, category, brand
  - Sort by relevance, price (asc/desc), rating`;

        const ast = parse(input);

        assert.equal(ast.features[0].items.length, 3);
        assert.ok(ast.features[0].items[1].includes('price range'));
    });
});

describe('Parser - Guide Declarations', () => {
    it('should parse a simple guide', () => {
        const input = `guide "Security":
  - Use bcrypt cost factor 12
  - Rate limit to 5 attempts per 15 minutes
  - Store sessions in Redis`;

        const ast = parse(input);

        assert.equal(ast.guides.length, 1);
        assert.equal(ast.guides[0].name, 'Security');
        assert.equal(ast.guides[0].items.length, 3);
    });

    it('should parse multiple guides', () => {
        const input = `guide "Performance":
  - Cache responses for 5 minutes

guide "UI/UX":
  - Use Material Design components
  - Add loading skeleton`;

        const ast = parse(input);

        assert.equal(ast.guides.length, 2);
        assert.equal(ast.guides[0].name, 'Performance');
        assert.equal(ast.guides[1].name, 'UI/UX');
    });

    it('should handle technical implementation details', () => {
        const input = `guide "Database":
  - Use connection pooling (min: 10, max: 100)
  - Index user.email and product.sku
  - Enable query logging in development`;

        const ast = parse(input);

        assert.equal(ast.guides[0].items.length, 3);
        assert.ok(ast.guides[0].items[0].includes('connection pooling'));
    });
});

describe('Parser - Import Statements', () => {
    it('should parse a single import', () => {
        const input = `import "shared/types.compose"

model User:
  name: text`;

        const ast = parse(input);

        assert.ok(ast);

        // Verify import is captured in AST
        assert.ok(ast.imports, 'AST should have imports property');
        assert.equal(ast.imports.length, 1, 'Should have 1 import');
        assert.equal(ast.imports[0].path, 'shared/types.compose');

        // Verify model is still parsed
        assert.equal(ast.models.length, 1);
        assert.equal(ast.models[0].name, 'User');
    });

    it('should parse multiple imports', () => {
        const input = `import "shared/types.compose"
import "shared/validators.compose"

model Order:
  total: number`;

        const ast = parse(input);

        assert.ok(ast);

        // Should have both imports
        assert.ok(ast.imports, 'AST should have imports property');
        assert.equal(ast.imports.length, 2, 'Should have 2 imports');

        // Model should still be parsed
        assert.equal(ast.models.length, 1);
    });

    it('should parse imports with relative paths', () => {
        const input = `import "./models/user.compose"
import "../shared/types.compose"

model Product:
  id: number`;

        const ast = parse(input);

        assert.ok(ast);
        assert.equal(ast.models.length, 1);
    });

    it('should parse imports without .compose extension', () => {
        const input = `import "shared/types"

model User:
  id: number`;

        const ast = parse(input);

        assert.ok(ast);
        assert.equal(ast.models.length, 1);
    });

    it('should parse imports at the beginning of file', () => {
        const input = `import "a.compose"
import "b.compose"
import "c.compose"

model Test:
  id: number`;

        const ast = parse(input);

        assert.ok(ast);
        // All imports should be parsed before models
        assert.equal(ast.models.length, 1);
    });

    it('should handle imports with various path formats', () => {
        const input = `import "shared/models.compose"
import "./local.compose"
import "../parent.compose"
import "models/user"

model MyModel:
  id: number`;

        const ast = parse(input);

        assert.ok(ast);
        assert.equal(ast.models.length, 1);
    });

    it('should preserve import order in AST', () => {
        const input = `import "first.compose"
import "second.compose"
import "third.compose"

model Test:
  id: number`;

        const ast = parse(input);

        assert.ok(ast);

        // Imports should maintain order
        assert.ok(ast.imports, 'AST should have imports property');
        assert.equal(ast.imports.length, 3, 'Should have 3 imports');

        // Verify they appear in the expected order
        assert.equal(ast.imports[0].path, 'first.compose');
        assert.equal(ast.imports[1].path, 'second.compose');
        assert.equal(ast.imports[2].path, 'third.compose');
    });
});


describe('Parser - Comments', () => {
    it('should ignore comments', () => {
        const input = `# This is a comment
model User:
  name: text  # Another comment`;

        const ast = parse(input);

        assert.equal(ast.models.length, 1);
        assert.equal(ast.models[0].name, 'User');
    });
});

describe('Parser - Complete Programs', () => {
    it('should parse a complete program with all constructs', () => {
        const input = `# E-commerce application
import "shared/types.compose"

model Product:
  id: number
  name: text
  price: number
  category: "electronics" | "clothing" | "food"
  tags: list of text
  inStock: bool

model Order:
  id: number
  userId: User
  items: list of Product
  status: "pending" | "paid" | "shipped"
  total: number

feature "Product Catalog":
  - Display products in a grid
  - Filter by category and price range
  - Search by product name

feature "Shopping Cart":
  - Add/remove items
  - Update quantities
  - Calculate total with tax

guide "Performance":
  - Cache product list for 10 minutes
  - Lazy load product images
  - Use database indexes on product.category

guide "Security":
  - Validate all prices server-side
  - Sanitize search queries`;

        const ast = parse(input);

        assert.equal(ast.models.length, 2);
        assert.equal(ast.features.length, 2);
        assert.equal(ast.guides.length, 2);
    });
});

describe('Parser - Edge Cases', () => {
    it('should parse empty program', () => {
        const input = ``;

        const ast = parse(input);

        assert.equal(ast.models.length, 0);
        assert.equal(ast.features.length, 0);
        assert.equal(ast.guides.length, 0);
    });

    it('should handle program with only comments', () => {
        const input = `# Just a comment
# Another comment`;

        const ast = parse(input);

        assert.equal(ast.models.length, 0);
    });

    it('should parse model with no fields', () => {
        const input = `model Empty:
  # No fields`;

        const ast = parse(input);

        assert.equal(ast.models[0].fields.length, 0);
    });

    it('should handle weird spacing', () => {
        const input = `model    User   :
  name  :   text
  age:number`;

        const ast = parse(input);

        assert.equal(ast.models[0].name, 'User');
        assert.equal(ast.models[0].fields.length, 2);
    });
});

describe('Parser - Error Cases', () => {
    it('should throw on invalid model syntax', () => {
        const input = `model  # Missing name`;

        assert.throws(() => {
            parse(input);
        });
    });

    it('should throw on invalid field syntax', () => {
        const input = `model User:
  name  # Missing type`;

        assert.throws(() => {
            parse(input);
        });
    });

    it('should throw on invalid feature syntax', () => {
        const input = `feature  # Missing name`;

        assert.throws(() => {
            parse(input);
        });
    });
});

#!/usr/bin/env node

/**
 * Generate IR from example Compose file
 */

import { readFileSync, writeFileSync } from 'fs';
import { compile } from '../compiler/index.js';

const source = readFileSync('./examples/customer.compose', 'utf8');
const result = compile(source, 'examples/customer.compose');

if (!result.success) {
    console.error('Compilation failed:');
    result.errors.forEach(err => {
        console.error(`  ${err.type}: ${err.message}`);
        console.error(`    at ${err.location.file}:${err.location.line}:${err.location.column}`);
    });
    process.exit(1);
}

// Write IR to file
const irJSON = JSON.stringify(result.ir, null, 2);
writeFileSync('./examples/customer.ir.json', irJSON);

console.log('✓ IR generated successfully');
console.log(`  Structures: ${result.ir.structures.length}`);
console.log(`  Variables: ${result.ir.variables.length}`);
console.log(`  Functions: ${result.ir.functions.length}`);
console.log(`  Frontend Pages: ${result.ir.frontend.pages.length}`);
console.log(`  Frontend Components: ${result.ir.frontend.components.length}`);
console.log(`  Backend APIs: ${result.ir.backend.apis.length}`);
console.log(`  Backend Queries: ${result.ir.backend.queries.length}`);
console.log('\nIR saved to: examples/customer.ir.json');

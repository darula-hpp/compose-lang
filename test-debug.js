// Quick test to check actual behavior
import { compile } from './compiler/index.js';

console.log('\n=== Test 1: Model with undefined reference ===');
const test1 = compile('model Order:\n  userId: User\n  total: number', 'test.compose');
console.log('Success:', test1.success);
console.log('Errors:', test1.errors);

console.log('\n=== Test 2: Model with import statement ===');
const test2 = compile('import "user.compose"\n\nmodel Order:\n  userId: User\n  total: number', 'test2.compose', { loadImports: false });
console.log('Success:', test2.success);
console.log('Errors:', test2.errors);
console.log('AST imports:', test2.ast?.imports);

console.log('\n=== Test 3: Check AST structure ===');
const test3Source = 'import "a.compose"\n\nmodel Test:\n  id: number';
const test3 = compile(test3Source, 'test3.compose', { loadImports: false, skipAnalysis: true });
console.log('Success:', test3.success);
console.log('AST has imports property:', test3.ast?.imports !== undefined);
console.log('AST imports:', test3.ast?.imports);
console.log('AST models:', test3.ast?.models?.length);

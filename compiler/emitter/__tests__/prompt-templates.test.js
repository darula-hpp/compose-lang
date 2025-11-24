/**
 * Prompt Templates Tests
 * Tests for LLM prompt generation
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { createFullProjectPrompt, createSystemPrompt } from '../prompt-templates.js';

describe('Prompt Templates', () => {
    describe('createSystemPrompt', () => {
        it('should create system prompt with framework', () => {
            const target = {
                framework: 'nextjs',
                language: 'typescript'
            };

            const prompt = createSystemPrompt(target);

            assert.ok(prompt.includes('nextjs'));
            assert.ok(prompt.includes('developer'));
        });

        it('should create system prompt without framework', () => {
            const target = {
                language: 'javascript'
            };

            const prompt = createSystemPrompt(target);

            assert.ok(prompt.includes('javascript'));
        });
    });

    describe('createFullProjectPrompt', () => {
        it('should include target configuration', () => {
            const ir = {
                models: [],
                features: [],
                guides: []
            };

            const target = {
                framework: 'react',
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('react'));
            assert.ok(prompt.includes('typescript'));
        });

        it('should include dependencies when provided', () => {
            const ir = {
                models: [],
                features: [],
                guides: []
            };

            const target = {
                framework: 'nextjs',
                language: 'typescript',
                output: './dist',
                dependencies: ['react-query', 'zustand', 'zod']
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('react-query'));
            assert.ok(prompt.includes('zustand'));
            assert.ok(prompt.includes('zod'));
        });

        it('should format models correctly', () => {
            const ir = {
                models: [
                    {
                        name: 'User',
                        fields: [
                            {
                                name: 'id',
                                type: { baseType: 'number', isArray: false, optional: false }
                            },
                            {
                                name: 'name',
                                type: { baseType: 'text', isArray: false, optional: false }
                            },
                            {
                                name: 'email',
                                type: { baseType: 'text', isArray: false, optional: true }
                            }
                        ]
                    }
                ],
                features: [],
                guides: []
            };

            const target = {
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('User'));
            assert.ok(prompt.includes('id: number'));
            assert.ok(prompt.includes('name: text'));
            assert.ok(prompt.includes('email: text?'));
        });

        it('should format list types correctly', () => {
            const ir = {
                models: [
                    {
                        name: 'Product',
                        fields: [
                            {
                                name: 'tags',
                                type: { baseType: 'text', isArray: true, optional: false }
                            }
                        ]
                    }
                ],
                features: [],
                guides: []
            };

            const target = {
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('list of text'));
        });

        it('should format enum types correctly', () => {
            const ir = {
                models: [
                    {
                        name: 'Order',
                        fields: [
                            {
                                name: 'status',
                                type: {
                                    baseType: 'text',
                                    isArray: false,
                                    optional: false,
                                    enumValues: ['pending', 'paid', 'shipped']
                                }
                            }
                        ]
                    }
                ],
                features: [],
                guides: []
            };

            const target = {
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('"pending"'));
            assert.ok(prompt.includes('"paid"'));
            assert.ok(prompt.includes('"shipped"'));
            assert.ok(prompt.includes('|'));
        });

        it('should include features', () => {
            const ir = {
                models: [],
                features: [
                    {
                        name: 'User Management',
                        items: [
                            'Create new users',
                            'Edit user profiles',
                            'Delete users with confirmation'
                        ]
                    }
                ],
                guides: []
            };

            const target = {
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('User Management'));
            assert.ok(prompt.includes('Create new users'));
            assert.ok(prompt.includes('Edit user profiles'));
        });

        it('should include guides', () => {
            const ir = {
                models: [],
                features: [],
                guides: [
                    {
                        name: 'Security',
                        hints: [
                            'Use bcrypt cost 12',
                            'Rate limit to 5 attempts per 15 min',
                            'Store sessions in Redis'
                        ]
                    }
                ]
            };

            const target = {
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('Security'));
            assert.ok(prompt.includes('bcrypt cost 12'));
            assert.ok(prompt.includes('Rate limit'));
        });

        it('should include extra rules from target', () => {
            const ir = {
                models: [],
                features: [],
                guides: []
            };

            const target = {
                language: 'typescript',
                output: './dist',
                extraRules: [
                    'Use Tailwind CSS for styling',
                    'Add dark mode support',
                    'Implement responsive design'
                ]
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('Tailwind CSS'));
            assert.ok(prompt.includes('dark mode'));
            assert.ok(prompt.includes('responsive design'));
        });

        it('should handle complete IR with all constructs', () => {
            const ir = {
                models: [
                    {
                        name: 'User',
                        fields: [
                            {
                                name: 'id',
                                type: { baseType: 'number', isArray: false, optional: false }
                            },
                            {
                                name: 'role',
                                type: {
                                    baseType: 'text',
                                    isArray: false,
                                    optional: false,
                                    enumValues: ['admin', 'member']
                                }
                            }
                        ]
                    }
                ],
                features: [
                    {
                        name: 'Authentication',
                        items: ['Login', 'Logout']
                    }
                ],
                guides: [
                    {
                        name: 'Performance',
                        hints: ['Cache user data']
                    }
                ]
            };

            const target = {
                framework: 'nextjs',
                language: 'typescript',
                output: './dist',
                dependencies: ['react-query'],
                extraRules: ['Use Server Components']
            };

            const prompt = createFullProjectPrompt(ir, target);

            // Check all sections are present
            assert.ok(prompt.includes('nextjs'));
            assert.ok(prompt.includes('User'));
            assert.ok(prompt.includes('Authentication'));
            assert.ok(prompt.includes('Performance'));
            assert.ok(prompt.includes('react-query'));
            assert.ok(prompt.includes('Server Components'));
        });

        it('should handle empty IR', () => {
            const ir = {
                models: [],
                features: [],
                guides: []
            };

            const target = {
                language: 'javascript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            // Should still have basic structure
            assert.ok(prompt.includes('javascript'));
            assert.ok(prompt.length > 0);
        });

        it('should include generation requirements section', () => {
            const ir = {
                models: [],
                features: [],
                guides: []
            };

            const target = {
                language: 'typescript',
                output: './dist'
            };

            const prompt = createFullProjectPrompt(ir, target);

            assert.ok(prompt.includes('Generation Requirements'));
            assert.ok(prompt.includes('production-ready'));
            assert.ok(prompt.includes('package.json'));
        });
    });
});

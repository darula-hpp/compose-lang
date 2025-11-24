/**
 * Target Configuration Tests
 * Bug-catching tests for compose.json validation
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateComposeConfig } from '../../compiler/emitter/compose-config.js';

describe('compose.json Validation', () => {

    describe('LLM Configuration', () => {

        it('should reject config without llm block', () => {
            const config = {
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('llm')));
        });

        it('should reject config without llm.provider', () => {
            const config = {
                llm: { model: 'gemini-2.5-flash', apiKey: '${KEY}' },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('provider')));
        });

        it('should reject invalid llm.provider', () => {
            const config = {
                llm: { provider: 'chatgpt', model: 'gpt-4', apiKey: '${KEY}' },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('provider') && e.includes('chatgpt')));
        });

        it('should accept valid providers', () => {
            const providers = ['gemini', 'openai', 'anthropic'];

            providers.forEach(provider => {
                const config = {
                    llm: { provider, model: 'model-name', apiKey: '${KEY}' },
                    targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
                };

                const errors = validateComposeConfig(config);
                const providerErrors = errors.filter(e => e.includes('provider'));
                assert.equal(providerErrors.length, 0, `Provider ${provider} should be valid`);
            });
        });

        it('should reject config without llm.model', () => {
            const config = {
                llm: { provider: 'gemini', apiKey: '${KEY}' },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('model')));
        });

        it('should reject config without llm.apiKey', () => {
            const config = {
                llm: { provider: 'gemini', model: 'gemini-2.5-flash' },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('apiKey')));
        });

        it('should reject invalid temperature', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}', temperature: 1.5 },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('temperature')));
        });

        it('should reject negative temperature', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}', temperature: -0.1 },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('temperature')));
        });

        it('should accept valid temperature', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}', temperature: 0.5 },
                targets: { web: { entry: './app.compose', language: 'typescript', output: './out' } }
            };

            const errors = validateComposeConfig(config);
            const tempErrors = errors.filter(e => e.includes('temperature'));
            assert.equal(tempErrors.length, 0);
        });
    });

    describe('Targets Configuration', () => {

        it('should reject config without targets', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('targets')));
        });

        it('should reject empty targets object', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {}
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('at least one target')));
        });

        it('should reject targets as array', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: []
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('must be an object')));
        });

        it('should reject target without entry', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: { language: 'typescript', output: './out' }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('entry')));
        });

        it('should reject target without language', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: { entry: './app.compose', output: './out' }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('language')));
        });

        it('should reject invalid language', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: { entry: './app.compose', language: 'java', output: './out' }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('language') && e.includes('java')));
        });

        it('should accept valid languages', () => {
            const languages = ['typescript', 'javascript', 'python', 'rust', 'go'];

            languages.forEach(language => {
                const config = {
                    llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                    targets: {
                        web: { entry: './app.compose', language, output: './out' }
                    }
                };

                const errors = validateComposeConfig(config);
                const langErrors = errors.filter(e => e.includes('language') && !e.includes('required'));
                assert.equal(langErrors.length, 0, `Language ${language} should be valid`);
            });
        });

        it('should reject target without output', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: { entry: './app.compose', language: 'typescript' }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('output')));
        });

        it('should reject duplicate output paths', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: { entry: './app.compose', language: 'typescript', output: './out' },
                    api: { entry: './api.compose', language: 'typescript', output: './out' }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('Duplicate output')));
        });

        it('should allow framework to be optional', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: { entry: './app.compose', language: 'typescript', output: './out' }
                    // No framework field
                }
            };

            const errors = validateComposeConfig(config);
            // Should NOT have errors about missing framework
            assert.ok(!errors.some(e => e.includes('framework') && e.includes('required')));
        });
    });

    describe('Optional Fields', () => {

        it('should reject dependencies if not array', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        dependencies: 'react'  // Should be array
                    }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('dependencies') && e.includes('array')));
        });

        it('should accept valid dependencies array', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        dependencies: ['react', 'react-dom']
                    }
                }
            };

            const errors = validateComposeConfig(config);
            const depErrors = errors.filter(e => e.includes('dependencies'));
            assert.equal(depErrors.length, 0);
        });

        it('should reject assets if not array', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        assets: { from: 'a', to: 'b' }  // Should be array
                    }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('assets') && e.includes('array')));
        });

        it('should reject malformed asset entries', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        assets: [
                            ['from', 'to'],  // Valid
                            'invalid',       // Invalid - not array
                            ['only-one']     // Invalid - needs 2 elements
                        ]
                    }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('assets[1]')));
            assert.ok(errors.some(e => e.includes('assets[2]')));
        });

        it('should accept valid assets format', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        assets: [
                            ['assets/logo.svg', 'public/logo.svg'],
                            ['assets/images', 'public/images']
                        ]
                    }
                }
            };

            const errors = validateComposeConfig(config);
            const assetErrors = errors.filter(e => e.includes('assets'));
            assert.equal(assetErrors.length, 0);
        });

        it('should reject extraRules if not array', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        extraRules: 'Use React'  // Should be array
                    }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('extraRules') && e.includes('array')));
        });

        it('should reject extraRules with non-string elements', () => {
            const config = {
                llm: { provider: 'gemini', model: 'model', apiKey: '${KEY}' },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './out',
                        extraRules: ['Valid rule', 123, true]  // Non-strings
                    }
                }
            };

            const errors = validateComposeConfig(config);
            assert.ok(errors.some(e => e.includes('extraRules') && e.includes('strings')));
        });
    });

    describe('Valid Complete Configurations', () => {

        it('should accept minimal valid config', () => {
            const config = {
                llm: {
                    provider: 'gemini',
                    model: 'gemini-2.5-flash',
                    apiKey: '${GEMINI_API_KEY}'
                },
                targets: {
                    web: {
                        entry: './app.compose',
                        language: 'typescript',
                        output: './generated/web'
                    }
                }
            };

            const errors = validateComposeConfig(config, undefined, true);
            assert.equal(errors.length, 0, `Should have no errors, got: ${errors.join(', ')}`);
        });

        it('should accept full config with all optional fields', () => {
            const config = {
                name: 'test-app',
                version: '1.0.0',
                llm: {
                    provider: 'gemini',
                    model: 'gemini-2.5-flash',
                    apiKey: '${KEY}',
                    temperature: 0.2,
                    maxTokens: 8192
                },
                targets: {
                    web: {
                        entry: './app.compose',
                        framework: 'nextjs',
                        language: 'typescript',
                        output: './generated/web',
                        dependencies: ['react', 'react-dom'],
                        assets: [['assets/logo.svg', 'public/logo.svg']],
                        extraRules: ['Use React Server Components']
                    }
                },
                global: {
                    packageManager: 'npm',
                    nodeVersion: '20'
                }
            };

            const errors = validateComposeConfig(config, undefined, true);
            assert.equal(errors.length, 0, `Should have no errors, got: ${errors.join(', ')}`);
        });
    });
});

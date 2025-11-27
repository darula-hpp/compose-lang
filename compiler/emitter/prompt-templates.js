/**
 * LLM Prompt Templates (v0.2.0)
 * Formats IR (models, features, guides) into LLM prompts
 */

/**
 * Create comprehensive prompt for full project generation
 * @param {object} ir - ComposeIR (v0.2.0 format)
 * @param {object} target - Target configuration
 * @returns {string} - Complete prompt for LLM
 */
export function createFullProjectPrompt(ir, target) {
    const sections = [];

    // Header
    sections.push(`You are an expert ${target.framework || target.language} developer.

Generate a complete, production-ready application based on the following specification.

**Target Stack:**
- Framework: ${target.framework || 'none'}
- Language: ${target.language}
- Output: ${target.output}
`);

    // Optional dependencies
    if (target.dependencies && target.dependencies.length > 0) {
        sections.push(`**Required Dependencies:**
${target.dependencies.map(dep => `- ${dep}`).join('\n')}
`);
    }

    // Models (Data)
    if (ir.models && ir.models.length > 0) {
        sections.push(`**Data Models:**
${formatModels(ir.models)}
`);
    }

    // Features (Behavior)
    if (ir.features && ir.features.length > 0) {
        sections.push(`**Application Features:**
${formatFeatures(ir.features)}
`);
    }

    // Guides (Implementation Hints)
    if (ir.guides && ir.guides.length > 0) {
        sections.push(`**Implementation Guidelines:**
${formatGuides(ir.guides)}
`);
    }

    // Extra rules from compose.json
    if (target.extraRules && target.extraRules.length > 0) {
        sections.push(`**Additional Requirements:**
${target.extraRules.map(rule => `- ${rule}`).join('\n')}
`);
    }

    // Footer instructions
    sections.push(`
**Generation Requirements:**

1. **Generate complete, working code** - All files needed for a functional application
2. **Follow best practices** - Use modern ${target.language} patterns and ${target.framework || 'framework'} conventions
3. **Production-ready** - Include error handling, validation, proper typing
4. **Well-organized** - Clear folder structure, modular components
5. **Documented** - Add helpful comments for complex logic
6. **Complete dependencies** - Generate package.json (or equivalent) with all required packages

**Output Format:**
Provide the complete project structure with all files and their contents.
Use the following format for each file:

### FILE: path/to/file.ext
... content ...

Do NOT include markdown code fences, explanations, or commentary - output ONLY the file blocks.`);

    return sections.join('\n');
}

/**
 * Create partial prompt for selective regeneration
 * @param {object} ir - ComposeIR (complete IR for context)
 * @param {Array} affectedFiles - List of files to regenerate
 * @param {object} context - Additional context (diff, existingFiles)
 * @param {object} target - Target configuration
 * @returns {string} - Partial prompt for LLM
 */
export function createPartialPrompt(ir, affectedFiles, context, target) {
    const sections = [];

    // Header - explain this is an update
    sections.push(`You are an expert ${target.framework || target.language} developer.

**THIS IS AN INCREMENTAL UPDATE** - You are updating an existing application, not creating a new one.

**Existing Code:**
The application already has ${context.existingFiles?.length || 0} files. DO NOT regenerate all files.

**Your Task:**
Regenerate ONLY these ${affectedFiles.length} file(s):
${affectedFiles.map(f => `- ${f}`).join('\n')}

**CRITICAL:** Output ONLY the files listed above. Do not regenerate other files.
`);

    // Explain what changed
    if (context.diff) {
        const changes = describeChanges(context.diff);
        if (changes) {
            sections.push(`**What Changed:**
${changes}
`);
        }
    }

    // Target stack (same as full prompt)
    sections.push(`**Target Stack:**
- Framework: ${target.framework || 'none'}
- Language: ${target.language}
- Output: ${target.output}
`);

    // Full IR for reference (models, features, guides)
    if (ir.models && ir.models.length > 0) {
        sections.push(`**Data Models (for reference):**
${formatModels(ir.models)}
`);
    }

    if (ir.features && ir.features.length > 0) {
        sections.push(`**Application Features (for reference):**
${formatFeatures(ir.features)}
`);
    }

    if (ir.guides && ir.guides.length > 0) {
        sections.push(`**Implementation Guidelines:**
${formatGuides(ir.guides)}
`);
    }

    // Generation instructions
    sections.push(`
**Generation Requirements:**

1. **Regenerate ONLY the listed files** - Do not create or modify other files
2. **Maintain consistency** - Follow the same patterns and architecture as existing code
3. **Production-ready** - Include error handling, validation, proper typing
4. **Preserve functionality** - Don't break existing features

**Output Format:**
Use the following format for each file:

### FILE: path/to/file.ext
... content ...

Output ONLY the ${affectedFiles.length} file(s) listed above. No explanations, no commentary.`);

    return sections.join('\n');
}

/**
 * Describe changes from diff object
 * @param {object} diff - Diff object from IRCache
 * @returns {string} - Human-readable description of changes
 */
function describeChanges(diff) {
    const changes = [];

    if (diff.models?.hasChanges) {
        if (diff.models.added.length > 0) {
            changes.push(`- Added models: ${diff.models.added.join(', ')}`);
        }
        if (diff.models.modified.length > 0) {
            changes.push(`- Modified models: ${diff.models.modified.join(', ')}`);
        }
        if (diff.models.removed.length > 0) {
            changes.push(`- Removed models: ${diff.models.removed.join(', ')}`);
        }
    }

    if (diff.features?.hasChanges) {
        if (diff.features.added.length > 0) {
            changes.push(`- Added features: ${diff.features.added.join(', ')}`);
        }
        if (diff.features.modified.length > 0) {
            changes.push(`- Modified features: ${diff.features.modified.join(', ')}`);
        }
        if (diff.features.removed.length > 0) {
            changes.push(`- Removed features: ${diff.features.removed.join(', ')}`);
        }
    }

    if (diff.guides?.hasChanges) {
        if (diff.guides.added.length > 0) {
            changes.push(`- Added guides: ${diff.guides.added.join(', ')}`);
        }
        if (diff.guides.modified.length > 0) {
            changes.push(`- Modified guides: ${diff.guides.modified.join(', ')}`);
        }
    }

    return changes.length > 0 ? changes.join('\n') : null;
}

/**
 * Format models for prompt
 */
function formatModels(models) {
    return models.map(model => {
        const fields = model.fields.map(field => {
            let typeStr = field.type.baseType;
            if (field.type.isArray) {
                typeStr = `list of ${typeStr}`;
            }
            if (field.type.optional) {
                typeStr += '?';
            }
            if (field.type.enumValues && field.type.enumValues.length > 0) {
                typeStr = field.type.enumValues.map(v => `"${v}"`).join(' | ');
            }
            return `  ${field.name}: ${typeStr}`;
        }).join('\n');

        return `${model.name}:\n${fields}`;
    }).join('\n\n');
}

/**
 * Format features for prompt
 */
function formatFeatures(features) {
    return features.map(feature => {
        const items = feature.description.map(item => `  - ${item}`).join('\n');
        return `${feature.name}:\n${items}`;
    }).join('\n\n');
}

/**
 * Format guides for prompt
 */
function formatGuides(guides) {
    return guides.map(guide => {
        const hints = guide.hints.map(hint => `  - ${hint}`).join('\n');
        return `${guide.name}:\n${hints}`;
    }).join('\n\n');
}

/**
 * Create system prompt (legacy - kept for compatibility)
 */
export function createSystemPrompt(target) {
    return `You are an expert ${target.framework || target.language} developer generating production-ready code.`;
}

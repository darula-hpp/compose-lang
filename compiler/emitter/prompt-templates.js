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

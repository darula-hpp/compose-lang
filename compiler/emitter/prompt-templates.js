/**
 * LLM Prompt Templates
 * Formats IR and context into LLM prompts for code generation
 */

/**
 * Create system prompt for code generation
 * @param {object} target - Target configuration
 * @returns {string} - System prompt
 */
export function createSystemPrompt(target) {
    return `You are an expert code generator specializing in ${target.type} development.

Your task is to generate production-ready, well-structured code from ComposeIR (Intermediate Representation).

Target Stack:
- Type: ${target.type}
- Framework: ${target.framework || 'none'}
- Language: ${target.language}
- Styling: ${target.styling || 'none'}

Guidelines:
1. Generate clean, idiomatic ${target.language} code
2. Follow ${target.type} best practices
3. Use modern ES6+ features for JavaScript
4. Include proper error handling
5. Add helpful comments for complex logic
6. Ensure type safety where applicable
7. Make code production-ready

Output only the requested code without explanations or markdown formatting unless specifically asked for file structure.`;
}

/**
 * Format IR for LLM context
 * @param {object} ir - ComposeIR object
 * @returns {string} - Formatted IR context
 */
export function formatIRContext(ir) {
    return `ComposeIR Module: ${ir.module}

${ir.context.length > 0 ? `Context:\n${ir.context.map(c => `- ${c}`).join('\n')}\n` : ''}
Imports: ${ir.imports.join(', ') || 'none'}

Data Structures (${ir.structures.length}):
${ir.structures.map(s => `- ${s.name}: ${s.fields.map(f => `${f.name}: ${JSON.stringify(f.type)}`).join(', ')}`).join('\n') || 'none'}

Variables (${ir.variables.length}):
${ir.variables.map(v => `- ${v.name}: ${v.type ? JSON.stringify(v.type) : v.explanation}`).join('\n') || 'none'}

Functions (${ir.functions.length}):
${ir.functions.map(f => `- ${f.name}(${f.inputs.map(i => `${i.name}: ${i.type}`).join(', ')}): ${f.returns || 'void'} - ${f.description}`).join('\n') || 'none'}

Frontend:
- Pages (${ir.frontend.pages.length}): ${ir.frontend.pages.map(p => `${p.name}${p.protected ? ' [protected]' : ''}`).join(', ') || 'none'}
- Components (${ir.frontend.components.length}): ${ir.frontend.components.map(c => c.name).join(', ') || 'none'}
- State (${ir.frontend.state.length}): ${ir.frontend.state.map(s => s.name).join(', ') || 'none'}
- Themes (${ir.frontend.themes.length}): ${ir.frontend.themes.map(t => t.name).join(', ') || 'none'}

Backend:
- APIs (${ir.backend.apis.length}): ${ir.backend.apis.map(a => a.name).join(', ') || 'none'}
- Queries (${ir.backend.queries.length}): ${ir.backend.queries.map(q => q.name).join(', ') || 'none'}
- Environment Variables: ${ir.backend.env.map(e => e.name).join(', ') || 'none'}`;
}

/**
 * Create prompt for structure generation
 * @param {object} structure - Structure from IR
 * @param {object} target - Target configuration
 * @returns {string} - Prompt for generating structure code
 */
export function createStructurePrompt(structure, target) {
    return `Generate a ${target.language} ${target.type === 'react' ? 'TypeScript interface or PropTypes' : 'class/type definition'} for the following data structure:

Name: ${structure.name}
Fields:
${structure.fields.map(f => `- ${f.name}: ${JSON.stringify(f.type)}`).join('\n')}

Generate only the code, no explanations.`;
}

/**
 * Create prompt for component generation
 * @param {object} component - Component from IR
 * @param {object} target - Target configuration
 * @returns {string} - Prompt for generating component code
 */
export function createComponentPrompt(component, target) {
    const propsSection = component.props.length > 0
        ? `Props:\n${component.props.map(p => `- ${p.name}: ${JSON.stringify(p.type)}`).join('\n')}`
        : 'No props';

    return `Generate a ${target.type} component with the following specification:

Component Name: ${component.name}
${propsSection}
Description: ${component.description}

Requirements:
- Use functional component with hooks
- Include proper prop validation
- Add helpful comments
- Follow ${target.type} best practices

Generate only the component code, no explanations.`;
}

/**
 * Create prompt for page generation
 * @param {object} page - Page from IR
 * @param {object} target - Target configuration
 * @returns {string} - Prompt for generating page code
 */
export function createPagePrompt(page, target) {
    return `Generate a ${target.type} page component with the following specification:

Page Name: ${page.name}
Protected: ${page.protected ? 'Yes (requires authentication)' : 'No'}
Description: ${page.description}

Requirements:
- Use functional component
${page.protected ? '- Include authentication check/redirect logic' : ''}
- Add proper routing setup
- Include helpful comments
- Follow ${target.type} best practices

Generate only the page component code, no explanations.`;
}

/**
 * Create prompt for API generation
 * @param {object} api - API from IR
 * @param {object} target - Target configuration
 * @returns {string} - Prompt for generating API code
 */
export function createAPIPrompt(api, target) {
    return `Generate a ${target.framework || target.type} API endpoint with the following specification:

API Name: ${api.name}
Description: ${api.description}

Requirements:
- Use ${target.framework || 'modern'} routing patterns
- Include proper error handling
- Add input validation
- Include helpful comments
- Follow REST API best practices

Generate only the API endpoint code, no explanations.`;
}

/**
 * Create prompt for function generation
 * @param {object} func - Function from IR
 * @param {object} target - Target configuration
 * @returns {string} - Prompt for generating function code
 */
export function createFunctionPrompt(func, target) {
    const inputsSection = func.inputs.length > 0
        ? `Parameters:\n${func.inputs.map(i => `- ${i.name}: ${i.type}`).join('\n')}`
        : 'No parameters';

    return `Generate a ${target.language} function with the following specification:

Function Name: ${func.name}
${inputsSection}
Returns: ${func.returns || 'void'}
Description: ${func.description}

Requirements:
- Implement the function based on the description
- Use modern ${target.language} syntax
- Include proper error handling
- Add helpful comments
- Ensure type correctness

Generate only the function code, no explanations.`;
}

/**
 * Create prompt for full project generation
 * @param {object} ir - Full ComposeIR
 * @param {object} target - Target configuration
 * @returns {string} - Prompt for generating complete project
 */
export function createProjectPrompt(ir, target) {
    return `${createSystemPrompt(target)}

Generate a complete ${target.type} project based on the following ComposeIR:

${formatIRContext(ir)}

Create a well-structured project with:
1. Proper folder structure
2. All components, pages, and utilities
3. Routing configuration
4. API endpoints (if backend)
5. package.json with dependencies
6. README with setup instructions

Provide the complete file structure and code for all files.`;
}

/**
 * IR Builder for Compose Language (v0.2.0)
 * Builds simplified IR from AST
 */

import { createIR, ModelIR, FieldIR, TypeIR, FeatureIR, GuideIR } from './ir-schema.js';
import { ReferenceLoader } from '../loader/reference-loader.js';

/**
 * Build IR from AST
 * @param {object} ast - Abstract Syntax Tree
 * @param {string} baseDir - Base directory for loading references
 */
export function buildIR(ast, baseDir = process.cwd()) {
    const ir = createIR();
    const referenceLoader = new ReferenceLoader(baseDir);

    // Convert models
    for (const modelNode of ast.models) {
        ir.models.push(buildModelIR(modelNode));
    }

    // Convert features
    for (const featureNode of ast.features) {
        ir.features.push(buildFeatureIR(featureNode));
    }

    // Convert guides (with reference loading)
    for (const guideNode of (ast.guides || [])) {
        ir.guides.push(buildGuideIR(guideNode, referenceLoader));
    }

    // Store imports
    ir.imports = ast.imports?.map(imp => imp.path) || [];

    return ir;
}

/**
 * Build Model IR from Model AST node
 */
function buildModelIR(modelNode) {
    const fields = modelNode.fields.map(buildFieldIR);
    return new ModelIR(modelNode.name, fields);
}

/**
 * Build Field IR from Field AST node
 */
function buildFieldIR(fieldNode) {
    const type = buildTypeIR(fieldNode.fieldType);
    return new FieldIR(
        fieldNode.name,
        type,
        fieldNode.optional,
        fieldNode.constraints
    );
}

/**
 * Build Type IR from Type AST node
 */
function buildTypeIR(typeNode) {
    return new TypeIR(
        typeNode.baseType,
        typeNode.isArray,
        typeNode.enumValues
    );
}

/**
 * Build Feature IR from Feature AST node
 */
function buildFeatureIR(featureNode) {
    return new FeatureIR(
        featureNode.name,
        featureNode.items
    );
}

/**
 * Build Guide IR from Guide AST node
 * Detects @reference markers and loads reference code
 * @param {object} guideNode - Guide AST node
 * @param {ReferenceLoader} referenceLoader - Reference loader instance
 */
function buildGuideIR(guideNode, referenceLoader) {
    const guide = new GuideIR(
        guideNode.name,
        guideNode.items
    );

    // Process bullets to find and load @reference markers
    const references = [];
    for (const bullet of guideNode.items) {
        // Match @reference/path with optional ::function
        const referenceMatch = bullet.match(/@reference\/[^\s]+/);
        if (referenceMatch) {
            const referencePath = referenceMatch[0];
            try {
                const reference = referenceLoader.loadReference(referencePath);
                if (reference) {
                    references.push(reference);
                }
            } catch (error) {
                console.warn(`⚠️  Failed to load reference ${referencePath}: ${error.message}`);
            }
        }
    }

    // Attach loaded references to the guide
    if (references.length > 0) {
        guide.references = references;
    }

    return guide;
}

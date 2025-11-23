/**
 * IR Builder for Compose Language (v0.2.0)
 * Builds simplified IR from AST
 */

import { createIR, ModelIR, FieldIR, TypeIR, FeatureIR, GuideIR } from './ir-schema.js';

/**
 * Build IR from AST
 */
export function buildIR(ast) {
    const ir = createIR();

    // Convert models
    for (const modelNode of ast.models) {
        ir.models.push(buildModelIR(modelNode));
    }

    // Convert features
    for (const featureNode of ast.features) {
        ir.features.push(buildFeatureIR(featureNode));
    }

    // Convert guides
    for (const guideNode of (ast.guides || [])) {
        ir.guides.push(buildGuideIR(guideNode));
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
 */
function buildGuideIR(guideNode) {
    return new GuideIR(
        guideNode.name,
        guideNode.items
    );
}

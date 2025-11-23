/**
 * AST Node Definitions for Compose Language (v0.2.0)
 * Simplified nodes for two-keyword syntax
 */

/**
 * Model Declaration Node
 * Represents: model User: ...
 */
export class ModelDeclaration {
    constructor(name, fields) {
        this.type = 'ModelDeclaration';
        this.name = name;
        this.fields = fields; // Array of FieldDeclaration
    }
}

/**
 * Field Declaration Node
 * Represents: email: text (unique)
 */
export class FieldDeclaration {
    constructor(name, fieldType, optional = false, constraints = []) {
        this.type = 'FieldDeclaration';
        this.name = name;
        this.fieldType = fieldType; // TypeAnnotation
        this.optional = optional;
        this.constraints = constraints; // ['unique', 'required']
    }
}

/**
 * Type Annotation Node
 */
export class TypeAnnotation {
    constructor(baseType, isArray = false, enumValues = null) {
        this.type = 'TypeAnnotation';
        this.baseType = baseType; // 'text', 'number', 'User', etc.
        this.isArray = isArray;
        this.enumValues = enumValues; // For "admin" | "member"
    }
}

/**
 * Feature Declaration Node
 * Represents: feature "Authentication": ...
 */
export class FeatureDeclaration {
    constructor(name, items) {
        this.type = 'FeatureDeclaration';
        this.name = name;
        this.items = items; // Array of strings (bullet points)
    }
}

/**
 * Guide Declaration Node
 * Represents: guide "Implementation Details": ...
 */
export class GuideDeclaration {
    constructor(name, items) {
        this.type = 'GuideDeclaration';
        this.name = name;
        this.items = items; // Array of strings (implementation hints)
    }
}

/**
 * Program Node (Root)
 */
export class Program {
    constructor(models = [], features = [], guides = []) {
        this.type = 'Program';
        this.models = models;
        this.features = features;
        this.guides = guides;
    }
}

/**
 * Import Declaration Node
 */
export class ImportDeclaration {
    constructor(path) {
        this.type = 'ImportDeclaration';
        this.path = path;
    }
}

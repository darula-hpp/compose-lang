/**
 * IR Schema for Compose Language (v0.2.0)
 * Simplified intermediate representation
 */

/**
 * Complete Intermediate Representation
 */
export const IRSchema = {
    models: [],      // Array of ModelIR
    features: [],    // Array of FeatureIR
    guides: [],      // Array of GuideIR
    imports: []      // Array of import paths
};

/**
 * Model IR
 */
export class ModelIR {
    constructor(name, fields) {
        this.name = name;
        this.fields = fields; // Array of FieldIR
    }
}

/**
 * Field IR
 */
export class FieldIR {
    constructor(name, type, optional, constraints) {
        this.name = name;
        this.type = type;         // TypeIR
        this.optional = optional;
        this.constraints = constraints; // ['unique', 'required']
    }
}

/**
 * Type IR
 */
export class TypeIR {
    constructor(baseType, isArray, enumValues) {
        this.baseType = baseType;
        this.isArray = isArray;
        this.enumValues = enumValues;
    }
}

/**
 * Feature IR
 */
export class FeatureIR {
    constructor(name, description) {
        this.name = name;
        this.description = description; // Array of strings or single string
    }
}

/**
 * Guide IR (implementation hints)
 */
export class GuideIR {
    constructor(name, hints) {
        this.name = name;
        this.hints = hints; // Array of strings (implementation details)
    }
}

/**
 * Create empty IR
 */
export function createIR() {
    return {
        models: [],
        features: [],
        guides: [],
        imports: []
    };
}

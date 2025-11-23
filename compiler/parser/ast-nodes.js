/**
 * AST Node definitions for the Compose language
 * These nodes represent the Abstract Syntax Tree structure
 */

/**
 * Base AST Node class
 */
export class ASTNode {
    constructor(type, location = null) {
        this.type = type;
        this.location = location; // { line, column, file }
    }
}

/**
 * Program - root node containing all statements
 */
export class Program extends ASTNode {
    constructor(statements = [], location = null) {
        super('Program', location);
        this.statements = statements;
    }
}

/**
 * Import statement
 */
export class ImportStatement extends ASTNode {
    constructor(path, location = null) {
        super('ImportStatement', location);
        this.path = path;
    }
}

/**
 * Context comment (## ... ##)
 */
export class ContextComment extends ASTNode {
    constructor(text, location = null) {
        super('ContextComment', location);
        this.text = text;
    }
}

// ==================== Data Definitions ====================

/**
 * Structure definition
 */
export class StructureDefinition extends ASTNode {
    constructor(name, fields = [], location = null) {
        super('StructureDefinition', location);
        this.name = name;
        this.fields = fields;
    }
}

/**
 * Field definition in a structure
 */
export class FieldDefinition extends ASTNode {
    constructor(name, fieldType, location = null) {
        super('FieldDefinition', location);
        this.name = name;
        this.fieldType = fieldType; // TypeNode
    }
}

/**
 * Variable definition
 */
export class VariableDefinition extends ASTNode {
    constructor(name, varType, explanation = null, location = null) {
        super('VariableDefinition', location);
        this.name = name;
        this.varType = varType; // TypeNode or null if explained
        this.explanation = explanation; // String or null
    }
}

/**
 * Function definition
 */
export class FunctionDefinition extends ASTNode {
    constructor(name, parameters = [], returnType = null, description = '', location = null) {
        super('FunctionDefinition', location);
        this.name = name;
        this.parameters = parameters; // Parameter[]
        this.returnType = returnType; // TypeNode or null
        this.description = description;
    }
}

/**
 * Function parameter
 */
export class Parameter extends ASTNode {
    constructor(name, paramType, location = null) {
        super('Parameter', location);
        this.name = name;
        this.paramType = paramType; // TypeNode
    }
}

// ==================== Type Nodes ====================

/**
 * Type reference
 */
export class TypeNode extends ASTNode {
    constructor(name, location = null) {
        super('TypeNode', location);
        this.name = name;
    }
}

/**
 * List type (list of X)
 */
export class ListTypeNode extends ASTNode {
    constructor(elementType, location = null) {
        super('ListTypeNode', location);
        this.elementType = elementType; // TypeNode
    }
}

// ==================== Frontend Nodes ====================

/**
 * Frontend page definition
 */
export class FrontendPage extends ASTNode {
    constructor(name, isProtected = false, description = '', location = null) {
        super('FrontendPage', location);
        this.name = name;
        this.isProtected = isProtected;
        this.description = description;
    }
}

/**
 * Frontend component definition
 */
export class FrontendComponent extends ASTNode {
    constructor(name, props = [], description = '', location = null) {
        super('FrontendComponent', location);
        this.name = name;
        this.props = props; // Parameter[]
        this.description = description;
    }
}

/**
 * Frontend state definition
 */
export class FrontendState extends ASTNode {
    constructor(name, explanation, location = null) {
        super('FrontendState', location);
        this.name = name;
        this.explanation = explanation;
    }
}

/**
 * Frontend render definition
 */
export class FrontendRender extends ASTNode {
    constructor(target, description, location = null) {
        super('FrontendRender', location);
        this.target = target;
        this.description = description;
    }
}

/**
 * Frontend theme definition
 */
export class FrontendTheme extends ASTNode {
    constructor(name, properties = {}, location = null) {
        super('FrontendTheme', location);
        this.name = name;
        this.properties = properties; // Object { key: value }
    }
}

// ==================== Backend Nodes ====================

/**
 * Backend read environment variable
 */
export class BackendReadEnv extends ASTNode {
    constructor(varName, location = null) {
        super('BackendReadEnv', location);
        this.varName = varName;
    }
}

/**
 * Backend read file
 */
export class BackendReadFile extends ASTNode {
    constructor(path, location = null) {
        super('BackendReadFile', location);
        this.path = path;
    }
}

/**
 * Backend save file
 */
export class BackendSaveFile extends ASTNode {
    constructor(path, location = null) {
        super('BackendSaveFile', location);
        this.path = path;
    }
}

/**
 * Backend API definition
 */
export class BackendAPI extends ASTNode {
    constructor(name, description, location = null) {
        super('BackendAPI', location);
        this.name = name;
        this.description = description;
    }
}

/**
 * Backend query definition
 */
export class BackendQuery extends ASTNode {
    constructor(name, description, location = null) {
        super('BackendQuery', location);
        this.name = name;
        this.description = description;
    }
}

/**
 * Backend connection definition
 */
export class BackendConnect extends ASTNode {
    constructor(name, config = {}, location = null) {
        super('BackendConnect', location);
        this.name = name;
        this.config = config; // Object { key: value }
    }
}

/**
 * Backend socket emit
 */
export class BackendEmit extends ASTNode {
    constructor(event, description, location = null) {
        super('BackendEmit', location);
        this.event = event;
        this.description = description;
    }
}

import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    Diagnostic,
    DiagnosticSeverity
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import compiler components
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compilerPath = join(__dirname, '../../compiler');

// Dynamically import compiler modules
let Lexer, Parser, Analyzer;
let compilerLoaded = false;

async function loadCompiler() {
    const { Lexer: L } = await import(`${compilerPath}/lexer/tokenizer.js`);
    const { Parser: P } = await import(`${compilerPath}/parser/parser.js`);
    const { SemanticAnalyzer: A } = await import(`${compilerPath}/analyzer/index.js`);

    Lexer = L;
    Parser = P;
    Analyzer = A;
    compilerLoaded = true;
}

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a document manager
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
        }
    };
});

// Validate a document
async function validateTextDocument(textDocument) {
    // Ensure compiler is loaded before validating
    if (!compilerLoaded) {
        console.warn('Compiler not yet loaded, skipping validation');
        return;
    }

    // Validate input
    if (!textDocument) {
        console.error('Invalid document provided to validateTextDocument');
        return;
    }

    const text = textDocument.getText();
    const diagnostics = [];

    try {
        // Tokenize
        const lexer = new Lexer(text);
        const tokens = lexer.tokenize();

        // Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Analyze
        const analyzer = new Analyzer({ loadImports: false });
        const result = analyzer.analyze(ast);

        // Convert errors to diagnostics
        if (result.errors && result.errors.length > 0) {
            for (const error of result.errors) {
                // Defensive: handle missing location data
                const line = Math.max(0, (error.location?.line || 1) - 1);
                const column = Math.max(0, (error.location?.column || 1) - 1);

                // Calculate a reasonable end character based on error message length
                // or use a sensible default (e.g., 50 characters)
                const endCharacter = column + Math.min(error.message?.length || 20, 50);

                const diagnostic = {
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: line,
                            character: column
                        },
                        end: {
                            line: line,
                            character: endCharacter
                        }
                    },
                    message: error.message || 'An error occurred',
                    source: 'compose'
                };
                diagnostics.push(diagnostic);
            }
        }
    } catch (error) {
        // Parser or analyzer error - provide helpful diagnostic
        const errorMessage = error.message || 'Unknown compilation error';

        // Try to extract line info from error message if available
        let line = 0;
        const lineMatch = errorMessage.match(/:([0-9]+):/);
        if (lineMatch) {
            line = Math.max(0, parseInt(lineMatch[1]) - 1);
        }

        const diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: line, character: 0 },
                end: { line: line, character: 50 }
            },
            message: errorMessage,
            source: 'compose'
        };
        diagnostics.push(diagnostic);
    }

    // Send the computed diagnostics to VS Code
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// The content of a text document has changed
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();

// Load compiler on startup
loadCompiler().then(() => {
    console.log('Compose Language Server started');
}).catch(err => {
    console.error('Failed to load compiler:', err);
});

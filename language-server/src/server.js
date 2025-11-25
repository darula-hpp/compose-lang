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
let Tokenizer, Parser, Analyzer;

async function loadCompiler() {
    const { Tokenizer: T } = await import(`${compilerPath}/lexer/tokenizer.js`);
    const { Parser: P } = await import(`${compilerPath}/parser/parser.js`);
    const { Analyzer: A } = await import(`${compilerPath}/analyzer/index.js`);

    Tokenizer = T;
    Parser = P;
    Analyzer = A;
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
    const text = textDocument.getText();
    const diagnostics = [];

    try {
        // Tokenize
        const tokenizer = new Tokenizer(text);
        const tokens = tokenizer.tokenize();

        // Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();

        // Analyze
        const analyzer = new Analyzer();
        const result = analyzer.analyze(ast);

        // Convert errors to diagnostics
        if (result.errors && result.errors.length > 0) {
            for (const error of result.errors) {
                const diagnostic = {
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: (error.location?.line || 1) - 1,
                            character: (error.location?.column || 1) - 1
                        },
                        end: {
                            line: (error.location?.line || 1) - 1,
                            character: (error.location?.column || 1) + 10
                        }
                    },
                    message: error.message,
                    source: 'compose'
                };
                diagnostics.push(diagnostic);
            }
        }
    } catch (error) {
        // Parser or analyzer error
        const diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 10 }
            },
            message: error.message || 'Unknown error',
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

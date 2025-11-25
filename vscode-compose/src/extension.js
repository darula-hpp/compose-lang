const vscode = require('vscode');
const path = require('path');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

let client;

/**
 * Extension activation
 */
function activate(context) {
    console.log('Compose Language extension is now active');

    // Start the language server
    startLanguageServer(context);

    // Register commands
    registerCommands(context);

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('compose.hasShownWelcome');
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Compose Language Support is now active! Use snippets like "model", "feature", "guide" to get started.',
            'Got it!'
        ).then(() => {
            context.globalState.update('compose.hasShownWelcome', true);
        });
    }
}

/**
 * Start the language server
 */
function startLanguageServer(context) {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(
        path.join('..', 'language-server', 'src', 'server.js')
    );

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc
        }
    };

    // Options to control the language client
    const clientOptions = {
        // Register the server for compose documents
        documentSelector: [{ scheme: 'file', language: 'compose' }],
        synchronize: {
            // Notify the server about file changes to '.compose' files
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.compose')
        }
    };

    // Create the language client and start the client
    client = new LanguageClient(
        'composeLanguageServer',
        'Compose Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

/**
 * Register extension commands
 */
function registerCommands(context) {
    // Build command
    const buildCommand = vscode.commands.registerCommand('compose.build', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const terminal = vscode.window.createTerminal('Compose Build');
        terminal.show();
        terminal.sendText('compose build');
    });

    // Dev command (watch mode)
    const devCommand = vscode.commands.registerCommand('compose.dev', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const terminal = vscode.window.createTerminal('Compose Dev');
        terminal.show();
        terminal.sendText('compose dev');
    });

    // Init command
    const initCommand = vscode.commands.registerCommand('compose.init', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project name',
            value: 'my-compose-app'
        });

        if (!projectName) return;

        const terminal = vscode.window.createTerminal('Compose Init');
        terminal.show();
        terminal.sendText(`compose init ${projectName}`);
    });

    context.subscriptions.push(buildCommand, devCommand, initCommand);
}

/**
 * Extension deactivation
 */
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

module.exports = {
    activate,
    deactivate
};

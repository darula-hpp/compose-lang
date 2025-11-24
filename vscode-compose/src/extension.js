const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

/**
 * Extension activation
 */
function activate(context) {
    console.log('Compose Language extension is now active');

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
    console.log('Compose Language extension is now deactivated');
}

module.exports = {
    activate,
    deactivate
};

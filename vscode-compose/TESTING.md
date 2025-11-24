# Testing the Extension

## Local Testing (Recommended)

1. **Open extension in VS Code:**
   ```bash
   cd vscode-compose
   code .
   ```

2. **Press F5** to launch Extension Development Host
   - This opens a new VS Code window with the extension loaded

3. **Test in the new window:**
   - Open one of the example .compose files from `../examples/`
   - Check syntax highlighting works
   - Try snippets: Type `model` and press Tab
   - Test commands: Cmd+Shift+P → "Compose: Build"

## Quick Test Checklist

- [ ] Syntax highlighting works for keywords (`model`, `feature`, `guide`)
- [ ] Types are highlighted (`text`, `number`, `bool`)
- [ ] Strings highlighted correctly
- [ ] Comments (#) are grayed out
- [ ] @ references highlighted
- [ ] Snippets work (model, feature, guide)
- [ ] Build command opens terminal
- [ ] No errors in Debug Console

## Packaging (For Distribution)

```bash
# Install vsce (VS Code Extension manager)
npm install -g @vscode/vsce

# Package extension
cd vscode-compose
vsce package

# Creates: compose-lang-0.1.0.vsix
```

## Installing Locally

```bash
# Install the .vsix file in VS Code
code --install-extension compose-lang-0.1.0.vsix
```

## Publishing (Future)

```bash
# Create publisher account at https://marketplace.visualstudio.com/
# vsce login <publisher-name>
# vsce publish
```

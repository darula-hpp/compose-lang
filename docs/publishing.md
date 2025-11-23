# Publishing Compose-Lang to npm

This guide walks you through publishing Compose-Lang to the npm registry.

## Prerequisites

1. **npm account** - Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI** - Comes with Node.js
3. **Git repository** - Code pushed to GitHub

## Step 1: Prepare package.json

✅ Already done! Your `package.json` now includes:
- `repository` - Links to GitHub
- `bugs` - Issue tracker URL
- `homepage` - Project homepage
- `engines` - Node.js version requirement
- `files` - Which files to include in the package
- `keywords` - For npm search discoverability

## Step 2: Choose a Package Name

**Current name:** `compose-lang`

Check if it's available:
```bash
npm

 view compose-lang
```

If taken, consider alternatives:
- `composelang`
- `@yourusername/compose-lang` (scoped package)
- `compose-language`

Update `package.json` if needed:
```json
{
  "name": "@yourusername/compose-lang"
}
```

## Step 3: Set Version

Use [Semantic Versioning](https://semver.org/):
- `0.1.0` - Initial development
- `1.0.0` - First stable release

Current version: `1.0.0` (already set)

## Step 4: Test Locally

```bash
# Link package globally for testing
npm link

# Test the CLI
compose --help
compose init
```

## Step 5: Login to npm

```bash
npm login
# Enter username, password, email
```

## Step 6: Publish

### First-time publish:
```bash
npm publish
```

### For scoped packages:
```bash
npm publish --access public
```

## Step 7: Verify Publication

```bash
npm view compose-lang

# Install globally to test
npm install -g compose-lang
```

---

## Updating the Package

### Patch release (bug fixes):
```bash
npm version patch  # 1.0.0 → 1.0.1
npm publish
```

### Minor release (new features):
```bash
npm version minor  # 1.0.1 → 1.1.0
npm publish
```

### Major release (breaking changes):
```bash
npm version major  # 1.1.0 → 2.0.0
npm publish
```

---

## Best Practices

### 1. Create `.npmignore`

```
# .npmignore
tests/
examples/
.github/
*.test.js
.env
.DS_Store
todo-demo*/
demo/
playground/
```

### 2. Test Before Publishing

```bash
# Dry run (see what will be published)
npm publish --dry-run
```

### 3. Add npm Badge to README

```markdown
[![npm version](https://img.shields.io/npm/v/compose-lang.svg)](https://www.npmjs.com/package/compose-lang)
[![npm downloads](https://img.shields.io/npm/dm/compose-lang.svg)](https://www.npmjs.com/package/compose-lang)
```

### 4. Tag Releases on GitHub

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Automation (Optional)

### GitHub Actions for Auto-Publishing

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Then add `NPM_TOKEN` to GitHub secrets.

---

## Troubleshooting

### "Package name already exists"
- Choose a different name
- Use a scoped package: `@username/compose-lang`

### "Must be logged in"
```bash
npm login
```

### "403 Forbidden"
- Check if you have publish rights
- For scoped packages, use `--access public`

### "ENEEDAUTH"
```bash
npm logout
npm login
```

---

## Post-Publication Checklist

- [ ] Package appears on [npmjs.com/package/compose-lang](https://npmjs.com/package/compose-lang)
- [ ] README displays correctly
- [ ] Can install globally: `npm install -g compose-lang`
- [ ] CLI works: `compose --version`
- [ ] Add npm badge to README
- [ ] Announce on Twitter, Reddit, etc.
- [ ] Create GitHub release with changelog

---

**Ready to publish?** Run `npm publish` and share Compose-Lang with the world! 🚀

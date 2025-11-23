/**
 * Eject Command
 * Moves generated code to permanent location and removes Compose management
 */

import { existsSync, readFileSync, writeFileSync, cpSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

export async function eject(args) {
    console.log('⚠️  Ejecting from Compose-Lang\n');
    console.log('This will:');
    console.log('  • Copy generated code to your project root');
    console.log('  • Remove Compose configuration');
    console.log('  • Archive .compose source files');
    console.log('  • You will need to maintain the code manually\n');

    // Confirm with user
    const confirmed = await confirmEject();
    if (!confirmed) {
        console.log('\n❌ Eject cancelled');
        return;
    }

    console.log('\n📦 Ejecting project...\n');

    // Load compose.json
    if (!existsSync('./compose.json')) {
        throw new Error('No compose.json found. Are you in a Compose project?');
    }

    const config = JSON.parse(readFileSync('./compose.json', 'utf8'));
    const targets = config.targets || {};

    // Copy generated code to permanent locations
    for (const [targetName, target] of Object.entries(targets)) {
        const generatedDir = target.output;

        if (!existsSync(generatedDir)) {
            console.log(`   ⚠️  Skipping ${targetName}: no generated code found`);
            continue;
        }

        // Determine permanent location
        const permanentDir = targetName === 'frontend' ? './frontend' : `./${targetName}`;

        console.log(`   📁 ${targetName}: ${generatedDir} → ${permanentDir}`);

        // Copy generated code
        if (existsSync(permanentDir)) {
            console.log(`      ⚠️  ${permanentDir} already exists, merging...`);
        }

        cpSync(generatedDir, permanentDir, { recursive: true, force: true });
        console.log(`      ✓ Copied`);
    }

    // Archive .compose files
    if (existsSync('./src')) {
        const archiveDir = './.compose-archive';
        console.log(`\n   📦 Archiving .compose files: ./src → ${archiveDir}`);

        if (!existsSync(archiveDir)) {
            mkdirSync(archiveDir, { recursive: true });
        }

        cpSync('./src', archiveDir, { recursive: true });
        rmSync('./src', { recursive: true, force: true });
        console.log(`      ✓ Archived`);
    }

    // Remove generated directory
    if (existsSync('./generated')) {
        console.log(`\n   🗑️  Removing ./generated`);
        rmSync('./generated', { recursive: true, force: true });
        console.log(`      ✓ Removed`);
    }

    // Remove compose.json
    console.log(`\n   🗑️  Removing compose.json`);
    rmSync('./compose.json');
    console.log(`      ✓ Removed`);

    // Remove cache
    if (existsSync('./.compose')) {
        console.log(`\n   🗑️  Removing .compose cache`);
        rmSync('./.compose', { recursive: true, force: true });
        console.log(`      ✓ Removed`);
    }

    // Create EJECTED.md with instructions
    const ejectedGuide = createEjectedGuide(targets);
    writeFileSync('./EJECTED.md', ejectedGuide);

    console.log('\n✨ Eject complete!\n');
    console.log('📄 See EJECTED.md for next steps.\n');
    console.log('Your code is now standalone. You can:');
    console.log('  • Modify any files without regenerating');
    console.log('  • Add new dependencies');
    console.log('  • Deploy like any normal project\n');
    console.log('⚠️  You can no longer use `compose build`\n');
}

/**
 * Confirm eject with user
 */
async function confirmEject() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Are you sure you want to eject? This cannot be undone. (yes/no): ', (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'yes');
        });
    });
}

/**
 * Create EJECTED.md with next steps
 */
function createEjectedGuide(targets) {
    const targetDirs = Object.entries(targets)
        .map(([name, target]) => {
            const dir = name === 'frontend' ? './frontend' : `./${name}`;
            return `- **${name}**: \`${dir}\``;
        })
        .join('\n');

    return `# Ejected from Compose-Lang

This project has been **ejected** from Compose-Lang management.

## What Changed

### Generated Code → Permanent Code
Your generated code has been moved to:

${targetDirs}

### Archived Files
- Original \`.compose\` files → \`./.compose-archive\` (for reference)
- \`compose.json\` → Removed
- \`generated/\` → Removed
- \`.compose/\` cache → Removed

## Next Steps

### 1. Install Dependencies

For each target, install dependencies:

\`\`\`bash
cd frontend
npm install

cd ../backend
npm install
\`\`\`

### 2. Run Development Servers

**Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

**Backend:**
\`\`\`bash
cd backend
npm run dev
\`\`\`

### 3. Make Changes

You now have full control! Modify any files:
- Add new components
- Change API endpoints
- Update dependencies
- Deploy to production

## Reverting (Not Recommended)

If you want to go back to Compose:

1. Move code back to \`generated/\`
2. Restore \`.compose\` files from \`.compose-archive/\`
3. Recreate \`compose.json\`
4. Run \`compose build\`

However, any manual changes will be **overwritten**.

## Going Forward

Your project is now a standard ${Object.keys(targets).map(t => targets[t].framework).join(' + ')} application.

- Follow normal development practices
- Deploy like any standard app
- Maintain code manually

**Happy coding!** 🚀
`;
}

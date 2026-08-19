/**
 * Minimal test runner. No framework: each test file is a standalone script
 * that prints PASS/FAIL lines and exits non-zero on failure.
 *
 *   npm test           fast, offline checks (no browser, no API calls)
 *   npm run test:pdf   renders real PDFs, needs a Chromium browser
 *   npm run test:ai    calls the Gemini API, needs GEMINI_API_KEY and costs money
 *   npm run test:all   everything
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Locate tsx's CLI entry point.
 *
 * `require.resolve('tsx/dist/cli.mjs')` is blocked by the package's `exports`
 * map, and the `.bin` shim differs per platform, so walk up from this file
 * looking for the installed package.
 */
function findTsxCli(): string {
    let dir = __dirname;
    for (let i = 0; i < 6; i++) {
        const candidate = path.join(dir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    throw new Error('Could not locate tsx. Run "npm install" first.');
}

const TSX_CLI = findTsxCli();

interface Suite {
    name: string;
    file: string;
    /** Why this is not part of the default run. */
    requires?: string;
}

const FAST: Suite[] = [
    { name: 'Whop webhook signature verification', file: 'webhook-sig.test.ts' },
    { name: 'Free/Pro tier rules and ATS feedback', file: 'tiers.test.ts' },
    { name: 'PDF watermark injection (all templates)', file: 'watermark.test.ts' },
    { name: 'Onboarding email rendering', file: 'email-render.test.ts' },
    { name: 'Unsubscribe link signing', file: 'unsubscribe.test.ts' },
];

const BROWSER: Suite[] = [
    { name: 'PDF end-to-end render', file: 'pdf-render.test.ts', requires: 'a Chromium browser' },
];

const AI: Suite[] = [
    { name: 'AI resume optimization contract', file: 'optimization.test.ts', requires: 'GEMINI_API_KEY (makes a real API call)' },
];

function run(suites: Suite[]): number {
    let failed = 0;

    for (const suite of suites) {
        console.log(`\n${'='.repeat(64)}\n  ${suite.name}${suite.requires ? `  [needs ${suite.requires}]` : ''}\n${'='.repeat(64)}`);

        // Spawn node against tsx's CLI entry point directly. Going through
        // `npx`/`npx.cmd` fails silently on Windows, and resolving the .bin
        // shim differs per platform.
        const result = spawnSync(
            process.execPath,
            [TSX_CLI, path.join(__dirname, suite.file)],
            { stdio: 'inherit', env: process.env }
        );

        if (result.status !== 0) {
            failed++;
            console.log(`\n>>> FAILED: ${suite.name}`);
        }
    }

    console.log(`\n${'='.repeat(64)}`);
    if (failed === 0) {
        console.log(`All ${suites.length} suite(s) passed.`);
    } else {
        console.log(`${failed} of ${suites.length} suite(s) failed.`);
    }
    return failed;
}

const mode = process.argv[2] ?? 'fast';
const selected =
    mode === 'all' ? [...FAST, ...BROWSER, ...AI]
    : mode === 'pdf' ? BROWSER
    : mode === 'ai' ? AI
    : FAST;

process.exit(run(selected) === 0 ? 0 : 1);

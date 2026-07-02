import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the external-imports plugin: run a *real* plugboy
 * build of a generated fixture and assert on the emitted rolldown diagnostics.
 *
 * The fixture lives directly under the repo root (not under `packages/**`) so
 * that pnpm's workspace globs never pick it up as a member and tsdown never
 * discovers plugboy's own `tsdown.config.ts` as an ancestor. It is created at
 * test time and removed afterwards, so it is invisible to `pnpm install`,
 * Turbo and `tsc`. The config is a plain object (no `@fastkit/plugboy` import)
 * so the build does not depend on plugboy's own `dist` being present.
 *
 * The build runs in a child `tsx` process: rolldown writes its diagnostics
 * straight to the OS stdout/stderr descriptors, so an in-process
 * `process.stderr.write` override would miss them — only capturing a child
 * process's output works.
 */

const REPO_ROOT = path.resolve(__dirname, '../../..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const DRIVER = path.join(__dirname, 'helpers/plugboy-build-driver.mts');
const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const ANSI_RE = /\[[0-9;]*m/g;

interface BuildResult {
  log: string;
  distCode: string;
}

function buildFixture(options: {
  imports: string[];
  neverBundle: string[];
}): BuildResult {
  const uniqueSuffix = `${Date.now()}-${createdDirs.length}`;
  const root = path.join(REPO_ROOT, `.tmp-plugboy-e2e-${uniqueSuffix}`);
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/self-ref',
      version: '0.0.0',
      type: 'module',
      exports: {
        '.': { types: './dist/pkg.d.mts', import: './dist/pkg.mjs' },
        './*': './dist/*',
      },
    }),
  );
  // Plain object (not `defineWorkspaceConfig`) to avoid importing the package
  // under test; `loadWorkspaceConfig` resolves the raw config itself.
  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `export default ${JSON.stringify({
      ignoreProjectConfig: true,
      entries: { '.': './src/index.ts' },
      deps: { neverBundle: options.neverBundle },
    })};\n`,
  );
  const body = options.imports
    .map((spec, i) => `import _${i} from '${spec}';`)
    .join('\n');
  fs.writeFileSync(
    path.join(dir, 'src/index.ts'),
    `${body}\nexport const refs = [${options.imports
      .map((_, i) => `_${i}`)
      .join(', ')}];\n`,
  );

  const result = spawnSync(TSX_BIN, [DRIVER, dir], {
    cwd: dir,
    encoding: 'utf8',
  });
  const log = `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(
    ANSI_RE,
    '',
  );
  const distPath = path.join(dir, 'dist/pkg.mjs');
  const distCode = fs.existsSync(distPath)
    ? fs.readFileSync(distPath, 'utf8')
    : '';
  return { log, distCode };
}

describe('external-imports build integration', () => {
  test('self-reference and neverBundle subpath imports build without UNRESOLVED_IMPORT', () => {
    const { log, distCode } = buildFixture({
      neverBundle: ['@plugboy-e2e/self-ref', 'declared-external'],
      imports: [
        // self-reference subpaths (served at runtime via the exports map)
        '@plugboy-e2e/self-ref/assets/logo.svg',
        '@plugboy-e2e/self-ref/assets/icon.svg',
        // a declared neverBundle package subpath
        'declared-external/deep/thing.js',
      ],
    });

    expect(log).not.toContain('UNRESOLVED_IMPORT');

    // dist keeps every import external (statements survive verbatim).
    expect(distCode).toContain('@plugboy-e2e/self-ref/assets/logo.svg');
    expect(distCode).toContain('@plugboy-e2e/self-ref/assets/icon.svg');
    expect(distCode).toContain('declared-external/deep/thing.js');
  }, 60_000);

  test('a genuinely unresolved specifier (typo) still warns', () => {
    const { log } = buildFixture({
      neverBundle: ['@plugboy-e2e/self-ref'],
      imports: [
        '@plugboy-e2e/self-ref/assets/logo.svg', // suppressed
        '@plugboy-e2e/typo-not-declared/whoops.svg', // must still warn
      ],
    });

    expect(log).toContain('UNRESOLVED_IMPORT');
    expect(log).toContain('@plugboy-e2e/typo-not-declared/whoops.svg');
    // The self-reference must not be the thing being warned about.
    expect(log).not.toContain('self-ref/assets/logo.svg');
  }, 60_000);
});

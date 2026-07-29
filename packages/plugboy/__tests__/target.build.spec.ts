import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the `target` option: run a *real* plugboy build of a
 * generated fixture and assert on the syntax of the emitted JavaScript.
 *
 * `target` is only observable through the output — plugboy hands it to tsdown,
 * which hands it to oxc — so the assertions look for syntax that a low target
 * has to downlevel: optional chaining / nullish coalescing (ES2020) disappear
 * under `es2015` and survive under `es2022`.
 *
 * Fixtures live under the repo root (outside `packages/**`) and are created and
 * removed at test time — see `external-imports.build.spec.ts` for the rationale.
 * Configs are plain objects (no `@fastkit/plugboy` import) so the build does not
 * depend on plugboy's own `dist` being present.
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

/** Optional chaining + nullish coalescing: both ES2020, both lowered by ES2015. */
const SOURCE = `export function pick(input?: { value?: string }) {
  return input?.value ?? 'fallback';
}
`;

/**
 * Build a fixture package and return its emitted JavaScript.
 *
 * `projectTarget` is only meaningful together with a fixture-owned project root:
 * when it is given, a private `package.json` + `plugboy.project.ts` are written
 * to the fixture root so the project lookup stops there instead of walking up to
 * fastkit's own project config.
 */
function buildFixture(options: {
  workspaceTarget?: unknown;
  projectTarget?: unknown;
}): string {
  const { workspaceTarget, projectTarget } = options;
  const withProject = projectTarget !== undefined;
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-target-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

  if (withProject) {
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({ name: '@plugboy-e2e/target-project', private: true }),
    );
    fs.writeFileSync(
      path.join(root, 'plugboy.project.ts'),
      `export default ${JSON.stringify({ target: projectTarget })};\n`,
    );
  }

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/target',
      version: '0.0.0',
      type: 'module',
      exports: {
        '.': { types: './dist/pkg.d.mts', import: './dist/pkg.mjs' },
        './*': './dist/*',
      },
    }),
  );
  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `export default ${JSON.stringify({
      // Without a fixture-owned project root the lookup would reach fastkit's
      // own `plugboy.project.ts`; ignoring it keeps the case isolated.
      ...(withProject ? {} : { ignoreProjectConfig: true }),
      entries: { '.': './src/index.ts' },
      ...(workspaceTarget === undefined ? {} : { target: workspaceTarget }),
    })};\n`,
  );
  fs.writeFileSync(path.join(dir, 'src/index.ts'), SOURCE);

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  return fs.readFileSync(path.join(dir, 'dist/pkg.mjs'), 'utf8');
}

/** True when the ES2020 syntax of `SOURCE` survived into the output as-is. */
function keptModernSyntax(code: string): boolean {
  return code.includes('?.') && code.includes('??');
}

describe('target option (integration)', () => {
  test('no target anywhere applies no transformation', () => {
    expect(keptModernSyntax(buildFixture({}))).toBe(true);
  }, 60_000);

  test('a workspace target downlevels the output', () => {
    expect(keptModernSyntax(buildFixture({ workspaceTarget: 'es2015' }))).toBe(
      false,
    );
  }, 60_000);

  test('a target list applies the most conservative entry', () => {
    // `node24` alone would keep the ES2020 syntax; the browser entry is what
    // forces the downlevel, proving every entry of the list is honored.
    const code = buildFixture({ workspaceTarget: ['node24', 'chrome60'] });
    expect(keptModernSyntax(code)).toBe(false);
  }, 60_000);

  test('a project target is inherited by the workspace', () => {
    expect(keptModernSyntax(buildFixture({ projectTarget: 'es2015' }))).toBe(
      false,
    );
  }, 60_000);

  test('a workspace target replaces the project target', () => {
    const code = buildFixture({
      projectTarget: 'es2015',
      workspaceTarget: 'es2022',
    });
    expect(keptModernSyntax(code)).toBe(true);
  }, 60_000);

  test('`false` at the workspace level disables the project target', () => {
    const code = buildFixture({
      projectTarget: 'es2015',
      workspaceTarget: false,
    });
    expect(keptModernSyntax(code)).toBe(true);
  }, 60_000);
});

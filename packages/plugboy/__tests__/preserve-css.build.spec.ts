import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the `preserve-css-imports` plugin: run a *real*
 * plugboy build of a generated fixture and assert on the head of the emitted
 * stylesheet.
 *
 * Both behaviours it guards are rewrites tsdown's CSS pipeline performs, so they
 * are only observable through a build with a `target` declared (without one,
 * lightningcss transforms nothing at all).
 *
 * Fixtures live under the repo root (outside `packages/**`) and are created and
 * removed at test time — see `external-imports.build.spec.ts` for the rationale.
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

/** Build a fixture whose entry imports `style.css`, and return that stylesheet. */
function buildFixture(
  style: string,
  extraFiles: Record<string, string> = {},
): string {
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-preserve-css-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/preserve-css',
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
      ignoreProjectConfig: true,
      entries: { '.': { src: './src/index.ts', css: true } },
      // A target is what makes lightningcss run in the first place.
      target: ['safari16'],
    })};\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'src/index.ts'),
    `import './style.css';\n\nexport const name = 'fixture';\n`,
  );
  fs.writeFileSync(path.join(dir, 'src/style.css'), style);
  for (const [name, contents] of Object.entries(extraFiles)) {
    fs.writeFileSync(path.join(dir, 'src', name), contents);
  }

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  const dist = path.join(dir, 'dist');
  const cssFiles = fs.readdirSync(dist).filter((f) => f.endsWith('.css'));
  expect(cssFiles).toHaveLength(1);
  return fs.readFileSync(path.join(dist, cssFiles[0]), 'utf8');
}

describe('preserve-css-imports (integration)', () => {
  test('the authored @layer order survives the CSS transform', () => {
    // lightningcss drops `reset` from the statement because the block below
    // establishes the same layer — sound for a standalone document, but here the
    // statement also orders `theme` / `components`, which belong to other
    // packages and have no block. Losing `reset` would promote it above them.
    const css = buildFixture(
      `@layer reset, theme, components;\n\n@layer reset { a { color: red } }\n`,
    );
    expect(css.split('\n')[0]).toBe('@layer reset, theme, components;');
  }, 60_000);

  test('a layer declared only in the statement is kept', () => {
    const css = buildFixture(`@layer only-declared;\n\n.a { color: red }\n`);
    expect(css.split('\n')[0]).toBe('@layer only-declared;');
  }, 60_000);

  test('an external @import stays external and precedes the rules', () => {
    const css = buildFixture(
      `@import url('some-pkg/theme.css');\n@import './local.css';\n.a { color: red }\n`,
      { 'local.css': '.local { color: green }\n' },
    );
    expect(css).toContain("@import url('some-pkg/theme.css');");
    // A relative import is internal, so it is inlined rather than preserved.
    expect(css).not.toContain('./local.css');
    expect(css).toContain('.local');
    expect(css.indexOf('@import')).toBeLessThan(css.indexOf('.a'));
  }, 60_000);
});

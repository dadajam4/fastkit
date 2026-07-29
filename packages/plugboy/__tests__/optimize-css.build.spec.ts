import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for `optimizeCSS`: run a *real* plugboy build of a
 * generated fixture and assert on the emitted stylesheet.
 *
 * The optimizations only exist in the output, and *which* stylesheets receive
 * them depends on build ordering: they are applied in `writeBundle`, on the
 * files on disk, because tsdown's own CSS pipeline emits from a plugin that runs
 * after every user plugin's `generateBundle`. A stylesheet tsdown produces is
 * therefore invisible to a `generateBundle`-time pass — which is what these
 * tests pin down.
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

/**
 * Build a fixture package whose entry imports a plain stylesheet — CSS that only
 * tsdown's pipeline produces — and return the emitted stylesheet.
 */
function buildFixture(options: {
  style: string;
  optimizeCSS?: unknown;
}): string {
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-optimize-css-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/optimize-css',
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
      ...(options.optimizeCSS === undefined
        ? {}
        : { optimizeCSS: options.optimizeCSS }),
    })};\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'src/index.ts'),
    `import './style.css';\n\nexport const name = 'fixture';\n`,
  );
  fs.writeFileSync(path.join(dir, 'src/style.css'), options.style);

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  // No `css.fileName` is declared, so tsdown emits under its own default.
  const dist = path.join(dir, 'dist');
  const cssFiles = fs.readdirSync(dist).filter((f) => f.endsWith('.css'));
  expect(cssFiles).toHaveLength(1);
  return fs.readFileSync(path.join(dist, cssFiles[0]), 'utf8');
}

/**
 * Two `:root` rules separated by another rule.
 *
 * `combineRules` is the assertion of choice here because it is plugboy's alone:
 * lightningcss merges duplicate `@layer` / `@media` blocks by itself, so those
 * would pass whether or not plugboy's postcss pass ran at all.
 */
const SPLIT_ROOT = ':root { --a: 1 }\n.x { color: red }\n:root { --b: 2 }\n';
const COMBINE_ROOT = { combineRules: { rules: [':root'] } };

describe('optimizeCSS (integration)', () => {
  test('it is applied to CSS emitted by tsdown’s own pipeline', () => {
    const css = buildFixture({
      style: SPLIT_ROOT,
      optimizeCSS: COMBINE_ROOT,
    });
    expect(css.match(/:root/g)).toHaveLength(1);
    expect(css).toContain('--a:1');
    expect(css).toContain('--b:2');
  }, 60_000);

  test('optimizeCSS: false leaves the stylesheet alone', () => {
    const css = buildFixture({ style: SPLIT_ROOT, optimizeCSS: false });
    expect(css.match(/:root/g)).toHaveLength(2);
  }, 60_000);
});

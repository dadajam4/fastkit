import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the order of a package's stylesheet: a style that
 * others build on has to come before them, whichever chunk it ends up in.
 *
 * The shape under test is a base stylesheet shared by two entries, so the build
 * moves it into a shared chunk. Bundle order puts that chunk *after* the entries,
 * and a merge in bundle order ships the base after the rules meant to override
 * it — which is what tsdown's own `splitting: false` merge does. Only a build
 * shows this.
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

interface FixtureOptions {
  /** `src` files, as `relative path -> contents`. */
  files: Record<string, string>;
  /** The workspace `entries`. */
  entries: Record<string, { src: string; css?: boolean }>;
  /** The workspace `css` option. */
  css?: Record<string, unknown>;
}

interface BuildResult {
  cssFiles: string[];
  read: (fileName: string) => string;
}

function buildFixture(options: FixtureOptions): BuildResult {
  const { files, entries, css } = options;
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-css-order-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/css-order',
      version: '0.0.0',
      type: 'module',
      exports: { './*': './dist/*' },
    }),
  );
  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `export default ${JSON.stringify({
      // Without a fixture-owned project root the lookup would reach fastkit's
      // own `plugboy.project.ts`; ignoring it keeps the case isolated.
      ignoreProjectConfig: true,
      entries,
      ...(css === undefined ? {} : { css }),
    })};\n`,
  );
  for (const [name, contents] of Object.entries(files)) {
    const target = path.join(dir, 'src', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  const dist = path.join(dir, 'dist');
  return {
    cssFiles: fs.readdirSync(dist).filter((f) => f.endsWith('.css')),
    read: (fileName) => fs.readFileSync(path.join(dist, fileName), 'utf8'),
  };
}

/**
 * A package with one CSS entry whose base styles land in a shared chunk.
 *
 * `base.ts` is imported by `.` and by `styles` (an entry without CSS), so the
 * build moves it — and `base.css` with it — into a chunk of its own. `.` then
 * adds `own.css`, which is meant to override the base.
 */
const SHARED_BASE: FixtureOptions = {
  files: {
    'base.css': '.base { padding: 0 }\n',
    'base.ts': "import './base.css';\n\nexport const base = 'base';\n",
    'own.css': '.own { padding: 12px }\n',
    'index.ts':
      "import { base } from './base';\nimport './own.css';\n\nexport const own = base;\n",
    'styles.ts': "export { base } from './base';\n",
  },
  entries: {
    '.': { src: './src/index.ts', css: true },
    styles: { src: './src/styles.ts' },
  },
};

/** Assert that `before` appears in `css`, and ahead of `after`. */
function expectBefore(css: string, before: string, after: string) {
  expect(css).toContain(before);
  expect(css).toContain(after);
  expect(css.indexOf(before)).toBeLessThan(css.indexOf(after));
}

describe('stylesheet order (integration)', () => {
  test('a shared base style comes before the styles built on it', () => {
    const { cssFiles, read } = buildFixture(SHARED_BASE);
    expect(cssFiles).toEqual(['pkg.css']);
    expectBefore(read('pkg.css'), '.base', '.own');
  }, 60_000);

  test('CSS behind a dynamic import is part of the stylesheet, last', () => {
    // Without `css.inject` nothing loads a per-chunk stylesheet at runtime, so
    // a dynamically imported chunk's CSS has to be in the package stylesheet —
    // not left behind under the chunk's hashed name.
    const { cssFiles, read } = buildFixture({
      files: {
        ...SHARED_BASE.files,
        'lazy.css': '.lazy { color: red }\n',
        'lazy.ts': "import './lazy.css';\n\nexport const lazy = 'lazy';\n",
        'index.ts': `${SHARED_BASE.files['index.ts']}export const load = () => import('./lazy');\n`,
      },
      entries: SHARED_BASE.entries,
    });
    expect(cssFiles).toEqual(['pkg.css']);
    const css = read('pkg.css');
    expectBefore(css, '.base', '.own');
    expectBefore(css, '.own', '.lazy');
  }, 60_000);

  test('css.fileName names the assembled stylesheet', () => {
    const { cssFiles, read } = buildFixture({
      ...SHARED_BASE,
      css: { fileName: 'bundle.css' },
    });
    expect(cssFiles).toEqual(['bundle.css']);
    expectBefore(read('bundle.css'), '.base', '.own');
  }, 60_000);

  test('an explicit splitting: false still emits the declared stylesheet', () => {
    // tsdown merges on its own here, so plugboy only names the file.
    const { cssFiles } = buildFixture({
      ...SHARED_BASE,
      css: { splitting: false },
    });
    expect(cssFiles).toEqual(['pkg.css']);
  }, 60_000);

  // Pins the upstream behaviour plugboy works around: tsdown's own merge
  // concatenates in bundle order, so the shared base lands last. When this
  // fails, tsdown orders the merge by dependency itself, and plugboy's
  // single-stylesheet assembly can be reconsidered.
  test("tsdown's own merge (splitting: false) still puts the shared base last", () => {
    const { read } = buildFixture({
      ...SHARED_BASE,
      css: { splitting: false },
    });
    expectBefore(read('pkg.css'), '.own', '.base');
  }, 60_000);
});

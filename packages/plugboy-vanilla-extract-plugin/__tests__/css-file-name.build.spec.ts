import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the name of the single combined stylesheet.
 *
 * plugboy declares a `./<entry>.css` export for every `css: true` entry,
 * normalizing the main entry (`.`) to the package directory name. With exactly
 * one such entry the plugin turns `css.splitting` off, so the whole package
 * collects into one file named by `css.fileName` — and that name has to be the
 * one plugboy declared, or the published export resolves to a file the build
 * never wrote.
 *
 * The name used to be derived from whether a `.` entry existed at all, which is
 * only the same thing when `.` is the entry carrying the CSS. A package whose
 * sole `css: true` entry is a secondary one emitted `dist/<package>.css` while
 * plugboy declared `./<entry>.css`: the build stayed green and the breakage
 * surfaced only in a consumer, as a missing stylesheet.
 *
 * Only a build shows this, and the assertion is made against the `exports` that
 * the build itself regenerates — the contract, rather than a hard-coded name.
 *
 * See `css-pipeline.build.spec.ts` for the fixture conventions (repo-root
 * location, `node_modules` symlink, plugin imported from source).
 */

const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const DRIVER = path.join(__dirname, 'helpers/plugboy-css-name-driver.mts');
const PLUGIN_SRC = path.join(PKG_ROOT, 'src');
const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const STYLE_CSS_TS = `import { style } from '@vanilla-extract/css';

export const host = style({ color: 'red' });
`;

interface BuildResult {
  /** Names of the emitted stylesheets. */
  cssFiles: string[];
  /** `./<id>.css` export id -> the `./dist/...` path plugboy declares for it. */
  cssExports: Record<string, string>;
  /** Whether every declared stylesheet export resolves to a file on disk. */
  missing: string[];
}

/**
 * Build a fixture whose entries are given as `id -> { hasCss }`.
 *
 * Every entry re-exports the same `.css.ts`, so which of them plugboy considers
 * to own the stylesheet is decided purely by the `css` flags.
 */
function buildFixture(entries: Record<string, { css: boolean }>): BuildResult {
  const root = path.join(
    REPO_ROOT,
    `.tmp-ve-css-name-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.symlinkSync(
    path.join(PKG_ROOT, 'node_modules'),
    path.join(root, 'node_modules'),
    'dir',
  );

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/ve-css-name',
      version: '0.0.0',
      type: 'module',
      exports: { './*': './dist/*' },
    }),
  );

  fs.writeFileSync(path.join(dir, 'src/style.css.ts'), STYLE_CSS_TS);

  const configEntries: Record<string, unknown> = {};
  for (const [id, { css }] of Object.entries(entries)) {
    const fileName = id === '.' ? 'index' : id;
    fs.writeFileSync(
      path.join(dir, `src/${fileName}.ts`),
      `export { host } from './style.css';\n`,
    );
    configEntries[id] = { src: `./src/${fileName}.ts`, css };
  }

  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `import { createVanillaExtractPlugin } from '${PLUGIN_SRC}';

export default {
  ...${JSON.stringify({ ignoreProjectConfig: true, entries: configEntries })},
  plugins: [createVanillaExtractPlugin()],
};
`,
  );

  const build = spawnSync(TSX_BIN, [DRIVER, dir], {
    cwd: dir,
    encoding: 'utf8',
  });
  // Surface the child's output: a failed build would otherwise show up only as
  // an empty `dist`, which reads like an assertion problem rather than a crash.
  if (build.status !== 0) {
    throw new Error(
      `fixture build failed (${build.status}):\n${build.stdout}\n${build.stderr}`,
    );
  }

  const dist = path.join(dir, 'dist');
  const declared: { id: string; at: string }[] = JSON.parse(
    fs.readFileSync(path.join(dir, 'declared-stylesheets.json'), 'utf8'),
  );
  const cssExports = Object.fromEntries(declared.map(({ id, at }) => [id, at]));

  return {
    cssFiles: fs.readdirSync(dist).filter((f) => f.endsWith('.css')),
    cssExports,
    missing: Object.values(cssExports).filter(
      (at) => !fs.existsSync(path.join(dir, at)),
    ),
  };
}

describe('single combined stylesheet name (integration)', () => {
  test('is named after the sole `css: true` entry, not the main entry', () => {
    // The shape that used to break: `.` exists but carries no CSS.
    const { cssFiles, cssExports, missing } = buildFixture({
      '.': { css: false },
      styles: { css: true },
    });

    expect(cssExports).toEqual({ './styles.css': './dist/styles.css' });
    expect(cssFiles).toEqual(['styles.css']);
    expect(missing).toEqual([]);
  }, 60_000);

  test('is named after the package directory when `.` carries the CSS', () => {
    // The pre-existing behaviour, which the fix must leave alone: the main
    // entry normalizes to the package directory name (`pkg`).
    const { cssFiles, cssExports, missing } = buildFixture({
      '.': { css: true },
    });

    expect(cssExports).toEqual({ './pkg.css': './dist/pkg.css' });
    expect(cssFiles).toEqual(['pkg.css']);
    expect(missing).toEqual([]);
  }, 60_000);

  test('declares a stylesheet per entry when several carry CSS', () => {
    // More than one `css: true` entry turns `splitting` on, so the name under
    // test is not in play — but the contract it protects still is.
    const { cssExports, missing } = buildFixture({
      '.': { css: false },
      styles: { css: true },
      other: { css: true },
    });

    expect(cssExports).toEqual({
      './styles.css': './dist/styles.css',
      './other.css': './dist/other.css',
    });
    expect(missing).toEqual([]);
  }, 60_000);
});

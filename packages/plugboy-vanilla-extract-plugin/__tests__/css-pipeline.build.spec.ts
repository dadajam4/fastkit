import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the CSS pipeline: run a *real* plugboy build of a
 * generated fixture and assert on the emitted stylesheet.
 *
 * The plugin hands vanilla-extract's extracted CSS to tsdown's own CSS pipeline
 * by resolving the virtual stylesheets as real modules. Everything that follows
 * from that — `css.target`, `css.transformer`, plugboy's `optimizeCSS`, and the
 * merge with plain CSS — is only observable through a build.
 *
 * The fixture lives directly under the repo root, not under `packages/**` —
 * pnpm's workspace glob is `packages/**`, so a fixture nested inside this package
 * *would* be picked up as a workspace member for as long as it exists (and two of
 * them collide on the same package name). It is created at test time and removed
 * afterwards, so it stays invisible to `pnpm install`, Turbo and `tsc`.
 *
 * A `node_modules` symlink into this package makes `@vanilla-extract/*` and
 * `@fastkit/plugboy` resolvable from the fixture; anything not linked there falls
 * through to the repo root, exactly as it would inside the package.
 */

const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const DRIVER = path.join(__dirname, 'helpers/plugboy-build-driver.mts');
const PLUGIN_SRC = path.join(PKG_ROOT, 'src');
const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** `user-select` needs `-webkit-` for Safari — the property under assertion. */
const STYLE_CSS_TS = `import { style } from '@vanilla-extract/css';

export const host = style({ userSelect: 'none' });
`;

interface FixtureOptions {
  /** Written into the workspace configuration verbatim. */
  target?: unknown;
  /** Written into the workspace configuration verbatim. */
  css?: Record<string, unknown>;
  /** Written into the workspace configuration verbatim. */
  optimizeCSS?: unknown;
  /**
   * Extra `src` files, as `relative path -> contents`. Anything listed here is
   * additionally re-exported (or `import`ed, for `.css`) from the entry.
   */
  files?: Record<string, string>;
  /** Raw source of `css` in the config, for values JSON cannot express. */
  rawCss?: string;
  /** Prepended to the generated config (imports, postcss plugins, …). */
  preamble?: string;
  /**
   * `src` of a second `css: true` entry, exercising the per-entry CSS contract:
   * plugboy declares a `./<entry>.css` export for each of them.
   */
  secondEntry?: string;
}

interface BuildResult {
  /** Names of the emitted stylesheets. */
  cssFiles: string[];
  /** Contents of an emitted stylesheet. */
  read: (fileName: string) => string;
}

/**
 * Build a fixture package with a `.css.ts` and return its emitted stylesheets.
 *
 * `ignoreProjectConfig` keeps fastkit's own `plugboy.project.ts` — which
 * declares a target of its own — out of the picture. The plugin is imported from
 * source, like the driver imports plugboy, so no built `dist` is needed.
 */
function buildFixture(options: FixtureOptions = {}): BuildResult {
  const {
    target,
    css,
    optimizeCSS,
    files = {},
    rawCss,
    preamble = '',
    secondEntry,
  } = options;
  const root = path.join(
    REPO_ROOT,
    `.tmp-ve-css-${Date.now()}-${createdDirs.length}`,
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
      name: '@plugboy-e2e/ve-css',
      version: '0.0.0',
      type: 'module',
      exports: {
        '.': { types: './dist/pkg.d.mts', import: './dist/pkg.mjs' },
        './*': './dist/*',
      },
    }),
  );

  const config: Record<string, unknown> = {
    ignoreProjectConfig: true,
    entries: {
      '.': { src: './src/index.ts', css: true },
      ...(secondEntry === undefined
        ? {}
        : { other: { src: './src/other.ts', css: true } }),
    },
    ...(target === undefined ? {} : { target }),
    ...(css === undefined ? {} : { css }),
    ...(optimizeCSS === undefined ? {} : { optimizeCSS }),
  };
  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `import { createVanillaExtractPlugin } from '${PLUGIN_SRC}';
${preamble}
export default {
  ...${JSON.stringify(config)},${rawCss ? `\n  css: ${rawCss},` : ''}
  plugins: [createVanillaExtractPlugin()],
};
`,
  );

  fs.writeFileSync(path.join(dir, 'src/style.css.ts'), STYLE_CSS_TS);
  const imports = ["export { host } from './style.css';"];
  for (const [name, contents] of Object.entries(files)) {
    const target = path.join(dir, 'src', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
    imports.push(
      name.endsWith('.css')
        ? `import './${name}';`
        : `export * from './${name.replace(/\.ts$/, '')}';`,
    );
  }
  fs.writeFileSync(path.join(dir, 'src/index.ts'), `${imports.join('\n')}\n`);

  if (secondEntry !== undefined) {
    fs.writeFileSync(path.join(dir, 'src/other.css.ts'), secondEntry);
    fs.writeFileSync(
      path.join(dir, 'src/other.ts'),
      `export * from './other.css';\n`,
    );
  }

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  const dist = path.join(dir, 'dist');
  return {
    cssFiles: fs.readdirSync(dist).filter((f) => f.endsWith('.css')),
    read: (fileName) => fs.readFileSync(path.join(dist, fileName), 'utf8'),
  };
}

describe('extracted CSS goes through tsdown’s CSS pipeline', () => {
  test('a workspace target prefixes the extracted CSS', () => {
    const { read } = buildFixture({ target: ['safari16'] });
    expect(read('pkg.css')).toContain('-webkit-user-select');
    expect(read('pkg.css')).toContain('user-select');
  }, 60_000);

  test('css.target takes precedence over target', () => {
    // Safari needs the prefix and Chrome does not, so the emitted CSS shows
    // which of the two values decided the transformation.
    const { read } = buildFixture({
      target: ['safari16'],
      css: { target: ['chrome120'] },
    });
    expect(read('pkg.css')).not.toContain('-webkit-user-select');
    expect(read('pkg.css')).toContain('user-select');
  }, 60_000);

  test('no target leaves the extracted CSS untransformed', () => {
    const { read } = buildFixture();
    expect(read('pkg.css')).not.toContain('-webkit-user-select');
    expect(read('pkg.css')).toContain('user-select');
  }, 60_000);

  test('the postcss transformer is applied to the extracted CSS too', () => {
    // `transformer: 'postcss'` is the branch a plugin-side lightningcss pass
    // could never have covered: tsdown runs postcss plugins before the target
    // transformation, and only CSS inside its pipeline sees them.
    const { read } = buildFixture({
      target: ['safari16'],
      preamble: `
const marker = {
  postcssPlugin: 'e2e-marker',
  Once(root) {
    root.append('.postcss-marker { color: red }');
  },
};
`,
      rawCss: `{ transformer: 'postcss', postcss: { plugins: [marker] } }`,
    });
    expect(read('pkg.css')).toContain('.postcss-marker');
    // The lightningcss target pass still runs after postcss.
    expect(read('pkg.css')).toContain('-webkit-user-select');
  }, 60_000);

  test('plugboy’s optimizeCSS still applies to the extracted CSS', () => {
    // `combineRules` is plugboy's own optimization — unlike duplicate `@layer` /
    // `@media` merging, which lightningcss performs by itself and would pass
    // whether or not plugboy's postcss pass ran. Since tsdown now emits this
    // stylesheet, and it does so after every user plugin's `generateBundle`, this
    // only holds because that pass moved to `writeBundle`.
    const globalRoot = (
      name: string,
    ) => `import { globalStyle } from '@vanilla-extract/css';

globalStyle(':root', { vars: { '--${name}': '1' } });
`;
    const { read } = buildFixture({
      optimizeCSS: { combineRules: { rules: [':root'] } },
      files: {
        'a.css.ts': globalRoot('a'),
        'b.css.ts': globalRoot('b'),
      },
    });
    const css = read('pkg.css');
    expect(css.match(/:root/g)).toHaveLength(1);
    expect(css).toContain('--a:1');
    expect(css).toContain('--b:1');
  }, 60_000);

  test('a generated @layer statement keeps its declared order', () => {
    // The layers are declared `outer` then `inner`, but only `inner` gets a
    // block. lightningcss prunes a name whose block follows in the same
    // stylesheet, so `inner` would be dropped from the statement and end up
    // established *after* `outer` — reversing the cascade the `.css.ts` declared.
    const { read } = buildFixture({
      target: ['safari16'],
      files: {
        'layers.css.ts': `import { globalLayer } from '@vanilla-extract/css';

export const outer = globalLayer('e2e-outer');
export const inner = globalLayer('e2e-inner');
`,
        'layered.css.ts': `import { style } from '@vanilla-extract/css';
import { inner } from './layers.css';

export const layered = style({
  '@layer': { [inner]: { color: 'red' } },
});
`,
      },
    });
    const css = read('pkg.css');
    expect(css.split('\n')[0]).toBe('@layer e2e-outer, e2e-inner;');
  }, 60_000);

  test('plain CSS and extracted CSS land in one stylesheet', () => {
    const { cssFiles, read } = buildFixture({
      files: { 'plain.css': '.plain { color: green }\n' },
    });
    expect(cssFiles).toEqual(['pkg.css']);
    expect(read('pkg.css')).toContain('.plain');
    expect(read('pkg.css')).toContain('user-select');
  }, 60_000);

  test('a second css entry gets its own stylesheet', () => {
    // plugboy declares `./pkg.css` and `./other.css` here, so the build has to
    // emit one stylesheet per entry — `css.splitting`. With a single combined
    // file, `splitting: false` keeps only one chunk's CSS and drops the rest.
    const { cssFiles, read } = buildFixture({
      target: ['safari16'],
      secondEntry: `import { style } from '@vanilla-extract/css';

export const other = style({ userSelect: 'text' });
`,
    });
    expect(cssFiles.sort()).toEqual(['other.css', 'pkg.css']);
    expect(read('pkg.css')).toContain('-webkit-user-select:none');
    expect(read('other.css')).toContain('-webkit-user-select:text');
  }, 60_000);
});

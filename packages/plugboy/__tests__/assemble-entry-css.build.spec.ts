import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the per-entry stylesheet contract: plugboy declares a
 * `./<entry>.css` export for every entry with `css: true`, so each of those files
 * has to exist and to be usable on its own.
 *
 * tsdown's `css.splitting` emits one stylesheet per output *chunk*, which does not
 * line up with that: CSS reached from several entries is moved into a shared
 * chunk's own stylesheet under a hashed name, and an entry whose CSS comes only
 * from there gets no stylesheet at all. Only a build shows this.
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

interface BuildResult {
  cssFiles: string[];
  read: (fileName: string) => string;
}

/**
 * Build a fixture with two `css: true` entries that share one stylesheet.
 *
 * `a` imports the shared stylesheet plus one of its own; `b` imports only the
 * shared one — the shape that leaves `b` with no stylesheet of its own.
 */
function buildFixture(css?: Record<string, unknown>): BuildResult {
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-entry-css-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/entry-css',
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
      entries: {
        a: { src: './src/a.ts', css: true },
        b: { src: './src/b.ts', css: true },
      },
      target: ['safari16'],
      ...(css === undefined ? {} : { css }),
    })};\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'src/shared.css'),
    '.shared { color: red }\n',
  );
  fs.writeFileSync(path.join(dir, 'src/own.css'), '.own { color: green }\n');
  fs.writeFileSync(
    path.join(dir, 'src/a.ts'),
    `import './shared.css';\nimport './own.css';\n\nexport const a = 'a';\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'src/b.ts'),
    `import './shared.css';\n\nexport const b = 'b';\n`,
  );

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  const dist = path.join(dir, 'dist');
  return {
    cssFiles: fs.readdirSync(dist).filter((f) => f.endsWith('.css')),
    read: (fileName) => fs.readFileSync(path.join(dist, fileName), 'utf8'),
  };
}

describe('per-entry stylesheets (integration)', () => {
  test('every declared entry stylesheet exists and is self-contained', () => {
    const { cssFiles, read } = buildFixture({ splitting: true });

    // Exactly the two declared exports — no hashed per-chunk leftovers.
    expect(cssFiles.sort()).toEqual(['a.css', 'b.css']);

    // `b` has no CSS of its own; everything it needs comes from the shared chunk.
    expect(read('b.css')).toContain('.shared');

    // `a` carries the shared CSS as well, dependencies first.
    const a = read('a.css');
    expect(a).toContain('.shared');
    expect(a).toContain('.own');
    expect(a.indexOf('.shared')).toBeLessThan(a.indexOf('.own'));
  }, 60_000);

  test('the assembled stylesheet still goes through optimizeCSS', () => {
    // `combineRules` is plugboy's own postcss optimization. It runs in
    // `writeBundle`, like the assembly, over a set of stylesheets that has to
    // include the assembled file — which is not a bundle asset, so walking the
    // bundle alone would skip it.
    const root = path.join(
      REPO_ROOT,
      `.tmp-plugboy-entry-css-opt-${Date.now()}`,
    );
    const dir = path.join(root, 'pkg');
    createdDirs.push(root);
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: '@plugboy-e2e/entry-css-opt',
        version: '0.0.0',
        type: 'module',
        exports: { './*': './dist/*' },
      }),
    );
    fs.writeFileSync(
      path.join(dir, 'plugboy.workspace.ts'),
      `export default ${JSON.stringify({
        ignoreProjectConfig: true,
        entries: {
          a: { src: './src/a.ts', css: true },
          b: { src: './src/b.ts', css: true },
        },
        target: ['safari16'],
        css: { splitting: true },
        optimizeCSS: { combineRules: { rules: [':root'] } },
      })};\n`,
    );
    // One `:root` in the shared stylesheet, one in the entry's own — combined
    // only if the postcss pass sees the assembled file.
    fs.writeFileSync(path.join(dir, 'src/shared.css'), ':root { --a: 1 }\n');
    fs.writeFileSync(path.join(dir, 'src/own.css'), ':root { --b: 2 }\n');
    fs.writeFileSync(
      path.join(dir, 'src/a.ts'),
      `import './shared.css';\nimport './own.css';\n\nexport const a = 'a';\n`,
    );
    fs.writeFileSync(
      path.join(dir, 'src/b.ts'),
      `import './shared.css';\n\nexport const b = 'b';\n`,
    );

    spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

    const a = fs.readFileSync(path.join(dir, 'dist/a.css'), 'utf8');
    expect(a.match(/:root/g)).toHaveLength(1);
    expect(a).toContain('--a:1');
    expect(a).toContain('--b:2');
  }, 60_000);
});

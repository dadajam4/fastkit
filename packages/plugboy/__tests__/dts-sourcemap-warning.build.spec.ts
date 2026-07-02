import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the dts SOURCEMAP_BROKEN suppression.
 *
 * `rolldown-plugin-dts`'s fake-js pass returns a mapless `"export { };"` string
 * for empty declaration chunks, which makes rolldown emit a spurious
 * `[SOURCEMAP_BROKEN]` warning when sourcemaps are enabled. An entry whose
 * declaration output is empty (e.g. `export {}`, or a package composed solely of
 * external re-exports) reproduces it.
 *
 * Fixtures live under the repo root (outside `packages/**`) and are created and
 * removed at test time — see `external-imports.build.spec.ts` for the rationale.
 * Builds run in a child `tsx` process so rolldown's native diagnostics are
 * captured at the OS level.
 */

const REPO_ROOT = path.resolve(__dirname, '../../..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const PLUGBOY_DRIVER = path.join(__dirname, 'helpers/plugboy-build-driver.mts');
const DTS_DRIVER = path.join(__dirname, 'helpers/dts-sourcemap-driver.mts');
const ANSI_RE = /\[[0-9;]*m/g;
const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** Create a fixture package whose entry emits an empty declaration file. */
function emptyDtsFixture(): string {
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-dts-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/reexport',
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
      ignoreProjectConfig: true,
      entries: { '.': './src/index.ts' },
    })};\n`,
  );
  // An empty type surface → empty .d.ts chunk → fake-js emits `"export { };"`.
  fs.writeFileSync(path.join(dir, 'src/index.ts'), 'export {};\n');
  return dir;
}

function run(driver: string, args: string[], cwd: string): string {
  const result = spawnSync(TSX_BIN, [driver, ...args], { cwd, encoding: 'utf8' });
  return `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(ANSI_RE, '');
}

describe('dts SOURCEMAP_BROKEN suppression (integration)', () => {
  test('a real plugboy build of an empty-dts package emits no SOURCEMAP_BROKEN', () => {
    const dir = emptyDtsFixture();
    const log = run(PLUGBOY_DRIVER, [dir], dir);
    expect(log).not.toContain('SOURCEMAP_BROKEN');
    // Sanity: the build actually produced the declaration file.
    expect(fs.existsSync(path.join(dir, 'dist/pkg.d.mts'))).toBe(true);
  }, 60_000);

  test('output is byte-identical with and without the suppression plugin', () => {
    const dir = emptyDtsFixture();
    run(DTS_DRIVER, [dir, 'out-suppress', 'suppress'], dir);
    run(DTS_DRIVER, [dir, 'out-plain', 'none'], dir);

    for (const file of ['pkg.d.mts', 'pkg.mjs']) {
      const a = path.join(dir, 'out-suppress', file);
      const b = path.join(dir, 'out-plain', file);
      expect(fs.existsSync(a), `${file} (suppress)`).toBe(true);
      expect(fs.existsSync(b), `${file} (plain)`).toBe(true);
      expect(fs.readFileSync(a)).toEqual(fs.readFileSync(b));
    }
  }, 60_000);

  test('a genuine JS-chunk sourcemap break is NOT suppressed (still warns)', () => {
    const dir = emptyDtsFixture();
    // `js-breaker` mode enables the suppress plugin AND a plugin that breaks the
    // JS chunk sourcemap — the warning must still surface.
    const log = run(DTS_DRIVER, [dir, 'out-breaker', 'js-breaker'], dir);
    expect(log).toContain('SOURCEMAP_BROKEN');
    expect(log).toContain('js-sourcemap-breaker');
  }, 60_000);
});

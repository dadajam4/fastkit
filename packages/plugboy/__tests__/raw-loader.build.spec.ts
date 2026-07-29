import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for `?raw` imports: run a *real* plugboy build of a
 * generated fixture and assert on the emitted JavaScript.
 *
 * The id of a virtual module reaches the output — rolldown prints it in the
 * `//#region <id>` comment ahead of the module, verbatim for anything starting
 * with `\0`, and feeds it into the chunk's content hash — so only a build shows
 * whether the id carries the build machine's directory layout.
 *
 * The asset is imported from two entries so it becomes a chunk of its own, which
 * is what makes its region comment appear at all; inlined into a single importer
 * it leaves nothing behind.
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
  /** Every emitted JavaScript file, concatenated. */
  js: string;
  /** File names emitted into `dist`. */
  files: string[];
}

/** Build a fixture whose two entries both inline the same asset with `?raw`. */
function buildFixture(): BuildResult {
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-raw-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src/assets'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/raw',
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
      entries: { a: { src: './src/a.ts' }, b: { src: './src/b.ts' } },
    })};\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'src/assets/logo.svg'),
    '<svg role="img"></svg>\n',
  );
  fs.writeFileSync(
    path.join(dir, 'src/a.ts'),
    `import logo from './assets/logo.svg?raw';\n\nexport const A = logo;\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'src/b.ts'),
    `import logo from './assets/logo.svg?raw';\n\nexport const B = logo.length;\n`,
  );

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  const dist = path.join(dir, 'dist');
  const files = fs.readdirSync(dist);
  return {
    js: files
      .filter((file) => file.endsWith('.mjs'))
      .map((file) => fs.readFileSync(path.join(dist, file), 'utf8'))
      .join('\n'),
    files,
  };
}

describe('?raw imports (integration)', () => {
  test('the asset is inlined', () => {
    const { js } = buildFixture();
    expect(js).toContain('<svg role=\\"img\\"></svg>');
  }, 60_000);

  test('the virtual id is relative to the workspace', () => {
    const { js } = buildFixture();

    // rolldown prints the id with the `\0` marker escaped, as two characters.
    expect(js).toContain(String.raw`//#region \0raw:src/assets/logo.svg`);

    // The fixture lives under the repo root, so ruling that out covers the
    // absolute form and every prefix of it.
    expect(js).not.toContain(REPO_ROOT);
    expect(js).not.toMatch(/\\0raw:([/\\]|[A-Za-z]:)/);
  }, 60_000);
});

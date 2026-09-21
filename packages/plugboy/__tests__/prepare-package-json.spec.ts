import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getWorkspace } from '../src/workspace';

/**
 * `preparePackageJSON()` rewrites the workspace's `package.json` on every build,
 * so what it writes — and whether it writes at all — is observable in the repo's
 * own git status.
 *
 * Fixtures go in a temp directory rather than under the repo root so the project
 * lookup walks past no `plugboy.project.ts` at all: these assertions are about
 * the file, not about project-level field syncing.
 */

const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function createFixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugboy-pkg-json-'));
  createdDirs.push(dir);

  fs.mkdirSync(path.join(dir, 'src'));
  fs.writeFileSync(path.join(dir, 'src/index.ts'), 'export const a = 1;\n');
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    `${JSON.stringify(
      {
        name: '@plugboy-test/prepare-package-json',
        version: '0.0.0',
        type: 'module',
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `export default ${JSON.stringify({
      entries: { '.': './src/index.ts' },
    })};\n`,
  );
  return dir;
}

async function prepare(dir: string) {
  const workspace = await getWorkspace(dir);
  await workspace.preparePackageJSON();
}

describe('preparePackageJSON', () => {
  test('writes a `package.json` that ends with a newline', async () => {
    const dir = createFixture();
    await prepare(dir);

    const content = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8');
    expect(content.endsWith('\n')).toBe(true);
    expect(content.endsWith('\n\n')).toBe(false);
    // The rewrite still happened: `exports` is generated from the entries.
    expect(JSON.parse(content).exports).toMatchObject({ './*': './dist/*' });
  });

  test('does not touch the file when nothing changed', async () => {
    const dir = createFixture();
    const file = path.join(dir, 'package.json');

    await prepare(dir);
    const first = fs.readFileSync(file, 'utf-8');
    // `writeFileAtomic` renames a temp file over the target, so a second write
    // would give the path a different inode.
    const { ino } = fs.statSync(file);

    await prepare(dir);

    expect(fs.readFileSync(file, 'utf-8')).toBe(first);
    expect(fs.statSync(file).ino).toBe(ino);
  });

  test('leaves a layout-only difference alone', async () => {
    const dir = createFixture();
    const file = path.join(dir, 'package.json');

    await prepare(dir);
    const json = JSON.parse(fs.readFileSync(file, 'utf-8'));

    // Same fields, same order, different whitespace -- and no final newline.
    // plugboy owns what the file says, not how a formatter lays it out, so it
    // has nothing to write here.
    const reformatted = JSON.stringify(json, null, 4);
    fs.writeFileSync(file, reformatted);
    const { ino } = fs.statSync(file);

    await prepare(dir);

    expect(fs.readFileSync(file, 'utf-8')).toBe(reformatted);
    expect(fs.statSync(file).ino).toBe(ino);
  });

  test('rewrites the file when the key order changed', async () => {
    const dir = createFixture();
    const file = path.join(dir, 'package.json');

    await prepare(dir);
    const first = fs.readFileSync(file, 'utf-8');
    const json = JSON.parse(first);

    // Key order is content: `sortPackageJson` has to keep working on files that
    // already exist, which is nearly all of them.
    const reversed = Object.fromEntries(Object.entries(json).reverse());
    fs.writeFileSync(file, `${JSON.stringify(reversed, null, 2)}\n`);

    await prepare(dir);

    expect(fs.readFileSync(file, 'utf-8')).toBe(first);
  });

  test('rewrites the file when the generated content changed', async () => {
    const dir = createFixture();
    const file = path.join(dir, 'package.json');

    await prepare(dir);
    const { ino } = fs.statSync(file);

    const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
    delete json.exports;
    fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);

    await prepare(dir);

    expect(fs.statSync(file).ino).not.toBe(ino);
    expect(JSON.parse(fs.readFileSync(file, 'utf-8')).exports).toMatchObject({
      './*': './dist/*',
    });
  });
});

import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import module from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { esbuildRequire } from '../src';

const require = module.createRequire(import.meta.url);
const execFileAsync = promisify(execFile);

/** The esbuild `@fastkit/node-util` itself depends on. */
const ownESbuildVersion = () =>
  (require('esbuild/package.json') as { version: string }).version;

/**
 * A stand-in for a consumer package: outside this workspace (so
 * `findPackageDir` stops at it rather than walking into the monorepo) and with
 * no `node_modules` of its own, which is the layout that exposes both bugs.
 * `esbuildRequire` reads `process.cwd()` to find it, hence the chdir.
 */
let consumerDir: string;
let originalCwd: string;

const CACHE_ROOT = 'node_modules/.esbuild-require';

async function writeEntry(relative: string, contents: string) {
  const file = path.join(consumerDir, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents, 'utf8');
  return file;
}

const cacheEntries = () => fs.readdir(path.join(consumerDir, CACHE_ROOT));

/** The bundle `esbuildRequire` wrote for the entry point with this basename. */
async function outfileOf(basename: string) {
  const dir = (await cacheEntries()).find((name) =>
    name.startsWith(`${basename}-`),
  );
  if (!dir) throw new Error(`no cache directory for ${basename}`);
  return path.join(consumerDir, CACHE_ROOT, dir, 'index.js');
}

beforeAll(async () => {
  originalCwd = process.cwd();
  consumerDir = await fs.mkdtemp(path.join(os.tmpdir(), 'esbuild-require-'));
  await fs.writeFile(
    path.join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'esbuild-require-consumer', private: true }),
    'utf8',
  );
  process.chdir(consumerDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(consumerDir, { recursive: true, force: true });
});

describe('cache directory name', () => {
  it('should stay within the 255 byte filename limit for a deep entry point', async () => {
    // Deep enough that the old scheme — the absolute path with every separator
    // replaced by `_` — would exceed NAME_MAX. A path from
    // `require.resolve()` reaches this on its own under pnpm.
    const deep = Array.from({ length: 8 }, (_, i) =>
      `directory-level-${i}`.padEnd(28, '-'),
    ).join('/');
    const entry = await writeEntry(
      `${deep}/entry.ts`,
      `export const value = 'deep';\n`,
    );
    expect(entry.replace(/\//g, '_').length).toBeGreaterThan(255);

    const result = await esbuildRequire<{ value: string }>(entry);
    expect(result.exports.value).toBe('deep');

    const [name, ...rest] = await cacheEntries();
    expect(rest).toStrictEqual([]);
    expect(Buffer.byteLength(name)).toBeLessThanOrEqual(255);
    expect(name).toMatch(/^entry\.ts-[0-9a-f]{16}$/);
  });

  it('should reuse the same directory for the same entry point', async () => {
    const before = await cacheEntries();
    const entry = path.join(consumerDir, 'stable.ts');
    await fs.writeFile(entry, `export const value = 1;\n`, 'utf8');

    const first = await esbuildRequire<{ value: number }>(entry);
    const afterFirst = await cacheEntries();
    const second = await esbuildRequire<{ value: number }>(entry);
    const afterSecond = await cacheEntries();

    expect(first.exports.value).toBe(1);
    expect(second.exports.value).toBe(1);
    expect(afterFirst.length).toBe(before.length + 1);
    expect(afterSecond).toStrictEqual(afterFirst);
  });

  it('should give two entry points with the same basename separate directories', async () => {
    const before = await cacheEntries();
    const a = await writeEntry('a/same.ts', `export const which = 'a';\n`);
    const b = await writeEntry('b/same.ts', `export const which = 'b';\n`);

    const resultA = await esbuildRequire<{ which: string }>(a);
    const resultB = await esbuildRequire<{ which: string }>(b);
    expect(resultA.exports.which).toBe('a');
    expect(resultB.exports.which).toBe('b');

    const after = await cacheEntries();
    expect(after.length).toBe(before.length + 2);
    expect(after.filter((name) => name.startsWith('same.ts-'))).toHaveLength(2);
  });
});

describe('esbuild resolution', () => {
  it('should leave no bare esbuild specifier in the emitted bundle', async () => {
    const entry = await writeEntry(
      'uses-esbuild.ts',
      [
        `import esbuild from 'esbuild';`,
        `export const version = esbuild.version;`,
        '',
      ].join('\n'),
    );

    const result = await esbuildRequire<{ version: string }>(entry);
    expect(result.exports.version).toBe(ownESbuildVersion());

    const bundle = await fs.readFile(
      await outfileOf('uses-esbuild.ts'),
      'utf8',
    );
    expect(bundle).not.toMatch(/require\(\s*["']esbuild["']\s*\)/);
    expect(bundle).toContain(require.resolve('esbuild'));
  });

  it('should be requirable by a consumer that has no esbuild of its own', async () => {
    const entry = await writeEntry(
      'consumer-side.ts',
      [
        `import esbuild from 'esbuild';`,
        `export const version = esbuild.version;`,
        '',
      ].join('\n'),
    );
    await esbuildRequire(entry);

    // The `require` inside `esbuildRequire` cannot show this on its own: run
    // from inside this workspace, `NODE_PATH` carries pnpm's hidden store (tsx
    // and vitest both set it), so a bare `require('esbuild')` resolves here
    // even though the consumer has nothing. A child process with `NODE_PATH`
    // cleared, from the consumer's directory, is the layout the bug was
    // reported from.
    const outfile = await outfileOf('consumer-side.ts');
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        '-e',
        `process.stdout.write(String(require(${JSON.stringify(outfile)}).version))`,
      ],
      { cwd: consumerDir, env: { ...process.env, NODE_PATH: '' } },
    );
    expect(stdout).toBe(ownESbuildVersion());
  });
});

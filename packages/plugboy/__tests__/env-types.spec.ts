import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Coverage for the two ambient entries the package publishes.
 *
 * `env.d.ts` mirrors a subset of Vite's `vite/client` module declarations, and
 * every one of those is declared by `vite/client` as well -- so a project that
 * loads both used to get a duplicate identifier for each of the 51 modules plus
 * `CSSModuleClasses` (issue #246). `globals.d.ts` exists for that case: it
 * carries only plugboy's own globals, and the asset types come from Vite.
 *
 * Nothing in a normal `tsc --noEmit` of this repo can catch a regression here,
 * because the collision needs a consumer to combine the two, and because
 * `skipLibCheck: true` (this repo's default) hides it. So the check has to build
 * a consumer and compile it with library checks on.
 *
 * Fixtures live under the repo root, outside `packages/**`, and are created and
 * removed at test time -- see `external-imports.build.spec.ts` for why.
 */

const REPO_ROOT = path.resolve(__dirname, '../../..');
const TSC_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsc');
const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** Type-check a generated consumer with library checks on, and return its errors. */
function checkConsumer(types: string[], source: string): string[] {
  const dir = path.join(
    REPO_ROOT,
    `.tmp-plugboy-env-${Date.now()}-${createdDirs.length}`,
  );
  createdDirs.push(dir);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'esnext',
        module: 'preserve',
        moduleResolution: 'bundler',
        noEmit: true,
        // The whole point: the collision is invisible with library checks off.
        skipLibCheck: false,
        types,
      },
      files: ['probe.ts'],
    }),
  );
  fs.writeFileSync(path.join(dir, 'probe.ts'), source);
  fs.writeFileSync(path.join(dir, 'asset.svg'), '<svg />');
  fs.writeFileSync(path.join(dir, 'styles.module.css'), '.a { color: red }');

  const result = spawnSync(TSC_BIN, ['-p', 'tsconfig.json'], {
    cwd: dir,
    encoding: 'utf8',
  });

  return `${result.stdout ?? ''}${result.stderr ?? ''}`
    .split('\n')
    .filter((line) => /error TS\d+/.test(line));
}

describe('ambient entries', () => {
  test('`env` alone types plugboy globals and the imports plugboy bundles', () => {
    const errors = checkConsumer(
      ['@fastkit/plugboy/env'],
      [
        `import asset from './asset.svg';`,
        `import classes from './styles.module.css';`,
        `export const dev: boolean = __PLUGBOY_DEV__;`,
        `export const stub: boolean = __PLUGBOY_STUB__;`,
        `export const url: string = asset;`,
        `export const className: string = classes.a;`,
        '',
      ].join('\n'),
    );
    expect(errors).toEqual([]);
  });

  test('`globals` alongside `vite/client` declares no module Vite already declares', () => {
    const errors = checkConsumer(
      ['@fastkit/plugboy/globals', 'vite/client'],
      [
        `import asset from './asset.svg';`,
        `export const dev: boolean = __PLUGBOY_DEV__;`,
        `export const stub: boolean = __PLUGBOY_STUB__;`,
        `export const url: string = asset;`,
        // Vite-only, and the reason a project reaches for `vite/client` at all.
        `export const mode: string = import.meta.env.MODE;`,
        '',
      ].join('\n'),
    );
    expect(errors).toEqual([]);
  });

  test('`globals` carries none of the module declarations itself', () => {
    const declarations = fs.readFileSync(
      path.join(__dirname, '../globals.d.ts'),
      'utf8',
    );
    expect(declarations).not.toMatch(/declare module/);
    expect(declarations).toMatch(/declare const __PLUGBOY_DEV__/);
    expect(declarations).toMatch(/declare const __PLUGBOY_STUB__/);
    // A top-level import or export would make the file a module, and a
    // `declare const` in a module file is not a global.
    expect(declarations).not.toMatch(/^\s*(import|export)\s/m);
  });
});

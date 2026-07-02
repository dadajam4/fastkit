import { describe, test, expect } from 'vitest';
import { createExternalImportsPlugin } from '../src/workspace/plugins/external-imports';
import { collectExternalStringPrefixes } from '../src/utils';
import type { PlugboyWorkspace } from '../src/workspace/workspace';

/**
 * Build a plugin against a stub workspace exposing only the fields the plugin
 * reads (`json.name`, `neverBundlePrefixes`).
 */
function pluginFor(name: string, neverBundlePrefixes: string[] = []) {
  const workspace = {
    json: { name },
    neverBundlePrefixes,
  } as unknown as PlugboyWorkspace;
  const plugin = createExternalImportsPlugin(workspace);
  const resolveId = plugin.resolveId as (
    id: string,
    importer?: string,
  ) => { id: string; external: true } | null;
  return (id: string) => resolveId(id);
}

describe('createExternalImportsPlugin', () => {
  const resolve = pluginFor('@scope/pkg', ['@scope/other', 'plain-pkg']);

  test('externalizes a self-reference by exact package name', () => {
    expect(resolve('@scope/pkg')).toEqual({
      id: '@scope/pkg',
      external: true,
    });
  });

  test('externalizes self-reference subpath imports', () => {
    expect(resolve('@scope/pkg/assets/logo.svg')).toEqual({
      id: '@scope/pkg/assets/logo.svg',
      external: true,
    });
  });

  test('externalizes declared neverBundle packages and their subpaths', () => {
    expect(resolve('@scope/other')).toEqual({
      id: '@scope/other',
      external: true,
    });
    expect(resolve('@scope/other/deep/thing.js')).toEqual({
      id: '@scope/other/deep/thing.js',
      external: true,
    });
    expect(resolve('plain-pkg/sub')).toEqual({
      id: 'plain-pkg/sub',
      external: true,
    });
  });

  test('does NOT suppress unrelated (typo) specifiers — they still warn', () => {
    expect(resolve('@scope/typo/whoops.svg')).toBeNull();
    expect(resolve('totally-unknown')).toBeNull();
  });

  test('respects the package-name boundary (no prefix bleed)', () => {
    // `@scope/pkg-extra` must not be treated as a subpath of `@scope/pkg`.
    expect(resolve('@scope/pkg-extra')).toBeNull();
    expect(resolve('@scope/otherwise')).toBeNull();
  });

  test('ignores relative, absolute and protocol specifiers', () => {
    expect(resolve('./local')).toBeNull();
    expect(resolve('../up')).toBeNull();
    expect(resolve('/abs/path')).toBeNull();
    expect(resolve('node:fs')).toBeNull();
    expect(resolve('data:text/plain,x')).toBeNull();
  });
});

describe('collectExternalStringPrefixes', () => {
  test('returns an empty array for empty input', () => {
    expect(collectExternalStringPrefixes(undefined)).toEqual([]);
    expect(collectExternalStringPrefixes([])).toEqual([]);
  });

  test('collects string entries, flattening nested arrays', () => {
    expect(collectExternalStringPrefixes('a')).toEqual(['a']);
    expect(collectExternalStringPrefixes(['a', 'b'])).toEqual(['a', 'b']);
    expect(collectExternalStringPrefixes(['a', ['b', ['c']]] as any)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  test('skips RegExp and function entries (opaque, not prefixable)', () => {
    expect(
      collectExternalStringPrefixes(['keep', /drop/, () => true] as any),
    ).toEqual(['keep']);
    expect(collectExternalStringPrefixes(() => true)).toEqual([]);
  });
});

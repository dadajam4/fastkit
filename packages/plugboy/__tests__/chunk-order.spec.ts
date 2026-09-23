import { describe, test, expect } from 'vitest';
import {
  type ChunkGraph,
  type ChunkGraphNode,
  entryChunksInDeclaredOrder,
  orderChunks,
  orderPackageChunks,
} from '../src/workspace/chunk-order';

function graphOf(nodes: Record<string, Partial<ChunkGraphNode>>): ChunkGraph {
  return new Map(
    Object.entries(nodes).map(([fileName, node]) => [
      fileName,
      {
        name: fileName.replace(/\.mjs$/, ''),
        isEntry: false,
        imports: [],
        dynamicImports: [],
        ...node,
      },
    ]),
  );
}

describe('orderChunks', () => {
  test('a chunk comes after every chunk it imports statically', () => {
    const graph = graphOf({
      'pkg.mjs': { isEntry: true, imports: ['shared.mjs', 'util.mjs'] },
      'shared.mjs': { imports: ['util.mjs'] },
      'util.mjs': {},
    });
    expect(orderChunks(graph, ['pkg.mjs'])).toEqual([
      'util.mjs',
      'shared.mjs',
      'pkg.mjs',
    ]);
  });

  test('dynamically imported chunks follow every static one, with their deps', () => {
    const graph = graphOf({
      'pkg.mjs': { isEntry: true, dynamicImports: ['lazy.mjs'] },
      'lazy.mjs': { imports: ['lazy-dep.mjs'], dynamicImports: ['lazier.mjs'] },
      'lazy-dep.mjs': {},
      'lazier.mjs': {},
    });
    expect(orderChunks(graph, ['pkg.mjs'])).toEqual([
      'pkg.mjs',
      'lazy-dep.mjs',
      'lazy.mjs',
      'lazier.mjs',
    ]);
  });

  test('a chunk reached both ways loads where it is first imported statically', () => {
    const graph = graphOf({
      'pkg.mjs': { isEntry: true, dynamicImports: ['shared.mjs'] },
      'other.mjs': { isEntry: true, imports: ['shared.mjs'] },
      'shared.mjs': {},
    });
    expect(orderChunks(graph, ['pkg.mjs', 'other.mjs'])).toEqual([
      'pkg.mjs',
      'shared.mjs',
      'other.mjs',
    ]);
  });

  test('chunks no root reaches are appended only on request', () => {
    const graph = graphOf({
      'pkg.mjs': { isEntry: true },
      'stray.mjs': {},
    });
    expect(orderChunks(graph, ['pkg.mjs'])).toEqual(['pkg.mjs']);
    expect(orderChunks(graph, ['pkg.mjs'], { includeUnreached: true })).toEqual(
      ['pkg.mjs', 'stray.mjs'],
    );
  });

  test('an import cycle terminates', () => {
    const graph = graphOf({
      'a.mjs': { isEntry: true, imports: ['b.mjs'] },
      'b.mjs': { imports: ['a.mjs'] },
    });
    expect(orderChunks(graph, ['a.mjs'])).toEqual(['b.mjs', 'a.mjs']);
  });
});

describe('entryChunksInDeclaredOrder', () => {
  test('follows the declared entry order, not the bundle order', () => {
    const graph = graphOf({
      'styles.mjs': { isEntry: true },
      'pkg.mjs': { isEntry: true },
      'chunk-x.mjs': {},
      'extra.mjs': { isEntry: true },
    });
    expect(entryChunksInDeclaredOrder(graph, ['pkg', 'styles'])).toEqual([
      'pkg.mjs',
      'styles.mjs',
      'extra.mjs',
    ]);
  });
});

describe('orderPackageChunks', () => {
  test('puts a shared chunk before the entries that depend on it', () => {
    // Bundle order — entries first — is the order a naive merge would use.
    const graph = graphOf({
      'pkg.mjs': { isEntry: true, imports: ['base-x.mjs'] },
      'styles.mjs': { isEntry: true, imports: ['base-x.mjs'] },
      'base-x.mjs': {},
    });
    expect(orderPackageChunks(graph, ['pkg', 'styles'])).toEqual([
      'base-x.mjs',
      'pkg.mjs',
      'styles.mjs',
    ]);
  });
});

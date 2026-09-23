/**
 * The order in which the chunks of a build load their stylesheets.
 *
 * A stylesheet's rules win over an earlier one's at equal specificity, so the
 * order chunks' CSS is concatenated in is part of what the CSS means. What a
 * package composes from — a shared reset, a vanilla-extract `style([base, …])`
 * — has to come before the rules that build on it.
 *
 * The bundle's own order does not give that. Entry chunks come first and the
 * chunks they import follow, so a shared chunk lands *after* the entries that
 * depend on it. `@tsdown/css` concatenates in that order when `css.splitting` is
 * off, and so did everything in plugboy that took `Object.values(bundle)` as the
 * load order.
 *
 * This walks the chunk graph the way Vite does for `build.cssCodeSplit: false`:
 * from each root, static imports first and the chunk itself after them; then the
 * dynamically imported chunks, which load later, in the order they were reached.
 * Every CSS producer in plugboy orders by this, so a package gets the same order
 * whichever of them emitted its styles.
 */

/** What the ordering needs to know about a chunk. */
export interface ChunkGraphNode {
  /** The chunk's name — for an entry chunk, the entry id plugboy declared. */
  name: string;
  isEntry: boolean;
  /** File names of the chunks this one imports statically. */
  imports: string[];
  /** File names of the chunks this one imports with `import()`. */
  dynamicImports: string[];
}

/** Chunk file name -> its node. Iteration order is the bundle's. */
export type ChunkGraph = Map<string, ChunkGraphNode>;

interface BundleChunkLike {
  type: string;
  fileName: string;
  name?: string;
  isEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
}

/**
 * Capture the chunk graph of a bundle.
 *
 * Call it from `generateBundle`, before `@tsdown/css` runs: that removes the
 * chunks holding nothing but CSS, together with every import of them, so a
 * graph captured later has lost exactly the edges that matter here.
 */
export function captureChunkGraph(
  bundle: Record<string, BundleChunkLike>,
): ChunkGraph {
  const graph: ChunkGraph = new Map();
  for (const chunk of Object.values(bundle)) {
    if (chunk.type !== 'chunk') continue;
    graph.set(chunk.fileName, {
      name: chunk.name ?? chunk.fileName,
      isEntry: !!chunk.isEntry,
      imports: [...(chunk.imports ?? [])],
      dynamicImports: [...(chunk.dynamicImports ?? [])],
    });
  }
  return graph;
}

/**
 * The entry chunks of a graph, in the order the entries were declared.
 *
 * `entryIds` are the names plugboy gives the entries (`.` normalized to the
 * package directory name). Entry chunks it does not name keep the bundle's order,
 * after the named ones.
 */
export function entryChunksInDeclaredOrder(
  graph: ChunkGraph,
  entryIds: readonly string[] = [],
): string[] {
  const rank = (node: ChunkGraphNode) => {
    const index = entryIds.indexOf(node.name);
    return index === -1 ? entryIds.length : index;
  };
  return [...graph]
    .filter(([, node]) => node.isEntry)
    .map(([fileName, node], position) => ({ fileName, node, position }))
    .sort((a, b) => rank(a.node) - rank(b.node) || a.position - b.position)
    .map(({ fileName }) => fileName);
}

export interface OrderChunksOptions {
  /**
   * Append the chunks no root reaches, in bundle order. Set it when the result
   * stands for the whole package; leave it off when it stands for one entry.
   */
  includeUnreached?: boolean;
}

/**
 * Chunk file names in load order, starting from `roots`.
 *
 * Each chunk appears once, after every chunk it imports statically. Chunks
 * reached only through `import()` follow all of those.
 */
export function orderChunks(
  graph: ChunkGraph,
  roots: readonly string[],
  options: OrderChunksOptions = {},
): string[] {
  const visited = new Set<string>();
  const ordered: string[] = [];
  const dynamic = new Set<string>();

  const walk = (fileName: string) => {
    if (visited.has(fileName)) return;
    visited.add(fileName);
    const node = graph.get(fileName);
    if (!node) return;
    for (const imported of node.imports) walk(imported);
    for (const imported of node.dynamicImports) dynamic.add(imported);
    ordered.push(fileName);
  };

  for (const root of roots) walk(root);
  // A `Set` visits what is added while it is being iterated, so a dynamic chunk
  // that imports another dynamically is covered too.
  for (const fileName of dynamic) walk(fileName);
  if (options.includeUnreached) {
    for (const fileName of graph.keys()) walk(fileName);
  }

  return ordered;
}

/**
 * Every chunk of the package in load order: the entries as declared, then what
 * they import dynamically, then anything left over.
 */
export function orderPackageChunks(
  graph: ChunkGraph,
  entryIds?: readonly string[],
): string[] {
  return orderChunks(graph, entryChunksInDeclaredOrder(graph, entryIds), {
    includeUnreached: true,
  });
}

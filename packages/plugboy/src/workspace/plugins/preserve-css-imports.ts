import fs from 'node:fs/promises';
import path from 'node:path';
import { definePlugin } from '../../utils';

/**
 * Plugin to preserve what tsdown's CSS pipeline would rewrite away at the top of
 * a stylesheet: external `@import` statements and the authored `@layer` order.
 *
 * **External `@import`s.** rolldown / tsdown's CSS pipeline (lightningcss)
 * resolves and inlines every `@import` it can. For bare package specifiers (e.g.
 * `@import url('material-symbols/rounded.css') layer(...)`) that is wrong for a
 * library build: it bloats the output and rebases the imported package's own
 * relative asset URLs (fonts) against our `dist`, breaking them. Such imports
 * should stay external so the consumer's bundler resolves them.
 *
 * **Layer order.** lightningcss drops a name from an `@layer a, b, c;` statement
 * when a block for it follows in the same stylesheet, since the block establishes
 * the same order. That holds for a standalone document, but not for a library
 * stylesheet whose statement also orders layers belonging to *other* packages:
 * once the name is gone, its position is decided by wherever its block happens to
 * land relative to those, and the authored order is lost. `@fastkit/vui` declares
 * `@layer vui-normalize, vui-color-scheme, …, vui;`, and losing `vui-normalize`
 * from it promoted the reset layer above the packages it is supposed to lose to.
 *
 * Both are captured from a `transform` hook declared `order: 'pre'`, which runs
 * ahead of tsdown's CSS handling even though that is registered as a *pre plugin*
 * — hook order wins over plugin order. It is the only point that sees the CSS of
 * **every** stylesheet in the graph, including a virtual one another plugin
 * supplies from `load`: vanilla-extract generates its `@layer` statements into
 * such a module, so a `load`-based capture would miss exactly the case where the
 * generated statement is the only record of the intended order. The captured
 * values are re-emitted in `writeBundle`, after every CSS producer has written
 * its final file to disk.
 */

/**
 * Matches a single `@import` statement, capturing the quote (group 1) and the
 * imported specifier (group 2). Handles `url(...)`, quoted, and bare forms, and
 * tolerates trailing conditions (e.g. `layer(...)`, media queries).
 */
const IMPORT_RE = /@import\s+(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?[^;]*;/g;

/**
 * A specifier is "internal" (safe to bundle/inline) when it is relative,
 * absolute, a URL, a data URI, or a fragment. Anything else is treated as a
 * bare package specifier whose `@import` is preserved.
 */
function isInternalImportSpecifier(spec: string): boolean {
  return /^(?:\.{1,2}\/|\/|[a-z][a-z\d+.-]*:|data:|#)/i.test(spec);
}

/** Matches a top-level `@layer <names>;` statement (declaration, not a block). */
const LAYER_STATEMENT_RE = /@layer\s+([^{};]+);[ \t]*\n?/g;

/** Stylesheet ids, with any query (`?source=…`, `?inline`) still attached. */
const STYLE_ID_RE = /\.(?:css|scss|sass|less|styl|stylus)(?:$|\?)/;

/** Collect the layer names of every `@layer a, b;` statement, in order. */
function collectLayerNames(css: string, into: string[]): void {
  for (const [, names] of css.matchAll(LAYER_STATEMENT_RE)) {
    for (const name of names.split(',')) {
      const trimmed = name.trim();
      if (trimmed && !into.includes(trimmed)) into.push(trimmed);
    }
  }
}

export function createPreserveCssImportsPlugin() {
  // External `@import` statements, kept verbatim and in first-seen order.
  const externalImports: string[] = [];
  // Layer names per stylesheet module, captured before lightningcss can prune the
  // statements they came from. Keyed by module id, because the order modules are
  // transformed in is not the order their CSS ends up in.
  const layersByModule = new Map<string, string[]>();
  // The same names flattened into declaration order, filled in `generateBundle`.
  const declaredLayers: string[] = [];
  // Absolute paths already rewritten, to stay idempotent across output passes.
  const processed = new Set<string>();

  return definePlugin({
    name: 'preserve-css-imports',
    buildStart() {
      externalImports.length = 0;
      layersByModule.clear();
      declaredLayers.length = 0;
      processed.clear();
    },
    // Runs ahead of tsdown's CSS transform, which inlines the imports and prunes
    // the layer statements, so this is where both have to be captured.
    transform: {
      order: 'pre' as const,
      filter: { id: STYLE_ID_RE },
      handler(code: string, id: string) {
        const file = id.split('?')[0];
        if (!STYLE_ID_RE.test(file)) return null;

        const names: string[] = [];
        collectLayerNames(code, names);
        if (names.length) layersByModule.set(id, names);

        // Only plain CSS is rewritten here. A preprocessor's `@import` is its own
        // module system, resolved before any CSS ever reaches tsdown.
        if (!file.endsWith('.css') || !code.includes('@import')) return null;

        let changed = false;
        const stripped = code.replace(IMPORT_RE, (statement, _quote, spec) => {
          if (isInternalImportSpecifier(spec)) return statement;
          changed = true;
          const normalized = statement.trim();
          if (!externalImports.includes(normalized)) {
            externalImports.push(normalized);
          }
          return '';
        });
        if (!changed) return null;
        return { code: stripped, map: null };
      },
    },
    // Flatten the per-module layer names into one declaration order.
    //
    // A module's position in `chunk.moduleIds` is its execution order, which is
    // also the order tsdown concatenates the modules' CSS in — so walking the
    // chunks and their modules reproduces the order the statements were authored
    // in. The order the `transform` hook happened to visit the modules in does
    // not: a layer's *users* are frequently transformed before the module that
    // declares the order.
    generateBundle(_options, bundle) {
      if (!layersByModule.size) return;
      declaredLayers.length = 0;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        for (const id of chunk.moduleIds) {
          for (const name of layersByModule.get(id) ?? []) {
            if (!declaredLayers.includes(name)) declaredLayers.push(name);
          }
        }
      }
    },
    // Re-emit the preserved imports and layer order into the final CSS files on
    // disk. Running in `writeBundle` (rather than `generateBundle`) lets every
    // other CSS producer — tsdown's own pipeline emits from a *post* plugin —
    // finish first.
    async writeBundle(options, bundle) {
      if (!externalImports.length && !declaredLayers.length) return;
      const { dir } = options;
      if (!dir) return;

      const importBlock = externalImports.length
        ? `${externalImports.join('\n')}\n`
        : '';

      await Promise.all(
        Object.values(bundle).map(async (chunk) => {
          if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.css')) {
            return;
          }
          const filePath = path.join(dir, chunk.fileName);
          if (processed.has(filePath)) return;

          let css: string;
          try {
            css = await fs.readFile(filePath, 'utf8');
          } catch {
            // The asset may have been removed by another plugin.
            return;
          }
          processed.add(filePath);

          // Hoist all `@layer <names>;` declarations to the top so the cascade
          // order is fixed before any layered `@import` adds to a layer, then
          // place the imports right after (they must precede every style rule).
          //
          // The captured names come first and in the order they were declared;
          // anything the emitted stylesheet still declares on its own is appended
          // after them.
          const layerNames = [...declaredLayers];
          collectLayerNames(css, layerNames);

          const body = css.replace(LAYER_STATEMENT_RE, '');
          const layerStatement = layerNames.length
            ? `@layer ${layerNames.join(', ')};\n`
            : '';
          const next = `${layerStatement}${importBlock}${body}`;
          if (next !== css) await fs.writeFile(filePath, next);
        }),
      );
    },
  });
}

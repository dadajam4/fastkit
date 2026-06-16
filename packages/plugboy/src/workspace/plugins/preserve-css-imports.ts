import fs from 'node:fs/promises';
import path from 'node:path';
import { definePlugin } from '../../utils';

/**
 * Plugin to preserve external CSS `@import` statements.
 *
 * rolldown / tsdown's CSS pipeline (lightningcss) resolves and inlines every
 * `@import` it can. For bare package specifiers (e.g.
 * `@import url('material-symbols/rounded.css') layer(...)`) that is wrong for a
 * library build: it bloats the output and rebases the imported package's own
 * relative asset URLs (fonts) against our `dist`, breaking them. Such imports
 * should stay external so the consumer's bundler resolves them.
 *
 * We can't intercept this in a `transform` hook — by then tsdown has already
 * inlined the imports. Instead we strip them in `load` (which runs before the
 * CSS transform), remember them, and re-emit them in `writeBundle`, after every
 * other CSS producer (including vanilla-extract's merge) has written the final
 * file to disk.
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

export function createPreserveCssImportsPlugin() {
  // External `@import` statements, kept verbatim and in first-seen order.
  const externalImports: string[] = [];
  // Absolute paths already rewritten, to stay idempotent across output passes.
  const processed = new Set<string>();

  return definePlugin({
    name: 'preserve-css-imports',
    buildStart() {
      externalImports.length = 0;
      processed.clear();
    },
    // `load` runs before the CSS `transform` that would otherwise inline the
    // imports, so this is where they have to be stripped.
    async load(id: string) {
      const file = id.split('?')[0];
      if (!file.endsWith('.css')) return null;

      let code: string;
      try {
        code = await fs.readFile(file, 'utf8');
      } catch {
        return null;
      }
      if (!code.includes('@import')) return null;

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
    // Re-emit the preserved imports into the final CSS files on disk. Running in
    // `writeBundle` (rather than `generateBundle`) lets other CSS producers —
    // e.g. the vanilla-extract plugin, which assembles its single stylesheet in
    // its own `writeBundle` — finish first.
    async writeBundle(options, bundle) {
      if (!externalImports.length) return;
      const { dir } = options;
      if (!dir) return;

      const importBlock = `${externalImports.join('\n')}\n`;

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
            // The asset may have been removed by another plugin (e.g. a
            // vanilla-extract temporary file merged elsewhere).
            return;
          }
          processed.add(filePath);

          // Hoist all `@layer <names>;` declarations to the top so the cascade
          // order is fixed before any layered `@import` adds to a layer, then
          // place the imports right after (they must precede every style rule).
          const layerNames: string[] = [];
          for (const [, names] of css.matchAll(LAYER_STATEMENT_RE)) {
            for (const name of names.split(',')) {
              const trimmed = name.trim();
              if (trimmed && !layerNames.includes(trimmed)) {
                layerNames.push(trimmed);
              }
            }
          }
          const body = css.replace(LAYER_STATEMENT_RE, '');
          const layerStatement = layerNames.length
            ? `@layer ${layerNames.join(', ')};\n`
            : '';
          await fs.writeFile(
            filePath,
            `${layerStatement}${importBlock}${body}`,
          );
        }),
      );
    },
  });
}

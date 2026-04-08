import { definePlugin } from '../../utils';

/**
 * Plugin to preserve CSS @import statements
 *
 * rolldown tries to resolve and inline CSS @import statements,
 * but external package CSS should be treated as external and output @import as-is.
 *
 * Note: rolldown parses and optimizes CSS independently, so placeholder approach doesn't work.
 * Instead, collect external import paths and prepend them to CSS in generateBundle.
 */

/**
 * Regular expression for CSS @import (with optional layer() support)
 *
 * Supports the following patterns:
 * - @import 'path';
 * - @import "path";
 * - @import url(path);
 * - @import url('path');
 * - @import url("path");
 * - @import url('path') layer(name);
 * - @import 'path' layer(name);
 *
 * Captures:
 *   1: import path
 *   2: layer specification (e.g. " layer(fabric.foundation)") or undefined
 */
const EXTERNAL_IMPORT_REGEX =
  /@import\s+(?:url\(\s*['"]?|['"])([^'"\s);]+)(?:['"]?\s*\)|['"])(\s+layer\([^)]+\))?\s*;/g;

interface ExternalCssImport {
  path: string;
  layer?: string;
}

function externalImportKey(entry: ExternalCssImport): string {
  return entry.layer ? `${entry.path}::${entry.layer}` : entry.path;
}

export function createPreserveCssImportsPlugin() {
  // Collect external CSS imports (using Map keyed by path+layer to avoid duplicates)
  const externalCssImports = new Map<string, ExternalCssImport>();

  return definePlugin({
    name: 'preserve-css-imports',
    transform: {
      handler(code: string, id: string) {
        // Only process CSS files
        if (!id.endsWith('.css')) {
          return null;
        }

        // Detect external package @import statements, collect them, and remove
        let hasExternalImports = false;
        const transformed = code.replace(
          EXTERNAL_IMPORT_REGEX,
          (match, importPath: string, layerSpec?: string) => {
            // If not a relative path (./) or absolute path (/), treat as package reference from node_modules
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
              hasExternalImports = true;
              const entry: ExternalCssImport = {
                path: importPath,
                layer: layerSpec?.trim(),
              };
              externalCssImports.set(externalImportKey(entry), entry);
              // Remove @import (replace with empty string)
              return '';
            }
            return match;
          },
        );

        if (hasExternalImports) {
          return { code: transformed, map: null };
        }
        return null;
      },
    },
    generateBundle: {
      handler(_options, bundle) {
        // Prepend collected external imports to CSS
        if (externalCssImports.size === 0) {
          return;
        }

        const importStatements = Array.from(externalCssImports.values())
          .map(({ path, layer }) =>
            layer ? `@import '${path}' ${layer};` : `@import '${path}';`,
          )
          .join('\n');

        for (const chunk of Object.values(bundle)) {
          if (
            chunk.type === 'asset' &&
            typeof chunk.source === 'string' &&
            chunk.fileName.endsWith('.css')
          ) {
            (chunk as { source: string }).source =
              importStatements + '\n' + chunk.source;
          }
        }
      },
    },
  });
}

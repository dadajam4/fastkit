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
 * Regular expression for CSS @import
 *
 * Supports the following patterns:
 * - @import 'path';
 * - @import "path";
 * - @import url(path);
 * - @import url('path');
 * - @import url("path");
 */
const EXTERNAL_IMPORT_REGEX =
  /@import\s+(?:url\(\s*['"]?|['"])([^'"\s);]+)(?:['"]?\s*\)|['"])\s*;/g;

export function createPreserveCssImportsPlugin() {
  // Collect external CSS import paths (using Set to avoid duplicates)
  const externalCssImports = new Set<string>();

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
          (match, importPath: string) => {
            // If not a relative path (./) or absolute path (/), treat as package reference from node_modules
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
              hasExternalImports = true;
              externalCssImports.add(importPath);
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

        const importStatements = Array.from(externalCssImports)
          .map((path) => `@import '${path}';`)
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

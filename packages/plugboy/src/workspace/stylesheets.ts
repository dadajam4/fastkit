import fs from 'node:fs/promises';
import path from 'node:path';
import type { CssOptions } from '@tsdown/css';
import type { PlugboyWorkspace } from './workspace';

/** `foo.mjs` -> `foo.css`, mirroring how `@tsdown/css` names a chunk's CSS. */
export function toCssFileName(jsFileName: string): string {
  return jsFileName.replace(/(?:\.module)?(\.[cm]?js)$/, '.css');
}

/** The stylesheets a package declares: `./<entry>.css` per `css: true` entry. */
export function declaredStylesheets(workspace: PlugboyWorkspace): Set<string> {
  return new Set(
    workspace.exports
      .filter((exp) => exp.id.endsWith('.css'))
      .map((exp) => path.posix.basename(exp.id)),
  );
}

/**
 * The file name of the package's one assembled stylesheet, or `undefined` when
 * plugboy does not assemble one.
 *
 * With a single CSS entry the package publishes one stylesheet holding all of its
 * CSS. `plugboy-assemble-entry-css` writes it under `css.fileName` when that is
 * set, and under the declared `<entry>.css` otherwise. With several CSS entries
 * each gets its own, so there is no package-wide one.
 */
export function assembledStylesheetName(
  workspace: PlugboyWorkspace,
): string | undefined {
  const { cssOptions } = workspace;
  if (!cssOptions?.splitting || cssOptions.inject) return undefined;
  const declared = declaredStylesheets(workspace);
  if (declared.size !== 1) return undefined;
  return cssOptions.fileName ?? [...declared][0];
}

/**
 * Every stylesheet the build has written to `dir`, as file names.
 *
 * The bundle is not the whole story: `plugboy-assemble-entry-css` writes the
 * declared stylesheets directly to disk, often under a name the build emitted
 * nothing for, so a `writeBundle` stage that only walked the bundle assets would
 * skip exactly the file that needed the most work. The declared exports — and the
 * package stylesheet's `css.fileName`, when one is set — fill that in: they are
 * the stylesheets the package publishes, so anything present under one of those
 * names belongs in the set.
 */
export async function listEmittedStylesheets(
  workspace: PlugboyWorkspace,
  dir: string,
  bundle: Record<string, { type: string; fileName: string }>,
): Promise<string[]> {
  const names = new Set<string>();
  for (const chunk of Object.values(bundle)) {
    if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
      names.add(chunk.fileName);
    }
  }

  const assembled = assembledStylesheetName(workspace);
  const candidates = new Set(declaredStylesheets(workspace));
  if (assembled) candidates.add(assembled);

  await Promise.all(
    [...candidates].map(async (name) => {
      if (names.has(name)) return;
      try {
        await fs.access(path.join(dir, name));
        names.add(name);
      } catch {
        // Not emitted — the entry produced no CSS at all.
      }
    }),
  );

  return [...names];
}

/**
 * Fill in the `css` options plugboy needs to deliver its declared stylesheets.
 *
 * `cssEntryIds` are the entries with `css: true`, named as plugboy names them
 * (`.` normalized to the package directory name).
 *
 * By default the build emits one stylesheet per chunk (`splitting: true`) and
 * `plugboy-assemble-entry-css` builds each declared stylesheet from them, in
 * dependency order. tsdown's own single-file merge is not used, because it
 * concatenates chunks in bundle order: a shared chunk lands after the entries
 * that compose from it, and loses to the base styles it was meant to override.
 * A `fileName` is still honored — it names the assembled stylesheet.
 *
 * tsdown merges into one file itself only where plugboy cannot assemble:
 * - `splitting` declared explicitly, which is applied as written;
 * - `inject`, where the JavaScript imports the per-chunk stylesheets by name, so
 *   they have to stay as emitted. One CSS entry then keeps a single file.
 *
 * A single file is named after the CSS entry unless `fileName` says otherwise, so
 * it is the file the `./<entry>.css` export points at. A workspace without CSS
 * entries is left to tsdown's defaults.
 */
export function resolveCssOptions(
  css: CssOptions | undefined,
  cssEntryIds: readonly string[],
): CssOptions | undefined {
  if (!cssEntryIds.length) return css;

  const splitting =
    css?.splitting ?? (css?.inject ? cssEntryIds.length > 1 : true);
  const resolved: CssOptions = { ...css, splitting };
  if (!splitting && cssEntryIds.length === 1) {
    resolved.fileName ??= `${cssEntryIds[0]}.css`;
  }
  return resolved;
}

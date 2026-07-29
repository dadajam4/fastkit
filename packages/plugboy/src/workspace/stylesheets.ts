import fs from 'node:fs/promises';
import path from 'node:path';
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
 * Every stylesheet the build has written to `dir`, as file names.
 *
 * The bundle is not the whole story: `plugboy-assemble-entry-css` writes an
 * entry's stylesheet directly to disk when the build produced none for it, so a
 * `writeBundle` stage that only walked the bundle assets would skip exactly the
 * file that needed the most work. The declared exports fill that in — they are the
 * stylesheets the package publishes, so anything present under one of those names
 * belongs in the set.
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

  await Promise.all(
    [...declaredStylesheets(workspace)].map(async (name) => {
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

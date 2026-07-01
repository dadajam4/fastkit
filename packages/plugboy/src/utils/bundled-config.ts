import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Compute the temporary output path for a `bundle-require`-bundled plugboy
 * config file (`plugboy.project.*` / `plugboy.workspace.*`).
 *
 * `bundle-require` bundles the config to a throwaway `.mjs` next to the source
 * before importing it. Its default places that file in the config's own
 * directory — e.g. `plugboy.project.bundled_<id>.mjs` at the repo root — which
 * is noisy and can be left behind if the build is force-killed.
 *
 * Redirect it under the config's own `node_modules/.plugboy/` instead:
 * - It lives inside `node_modules`, so it is already gitignored and out of the
 *   consumer's sight (and any straggler after a hard kill stays hidden there).
 * - Module resolution is unchanged: the bundled file keeps bare imports for
 *   externalized dependencies, and Node resolves them by walking up to the same
 *   `<configDir>/node_modules` it would have used at the original location.
 *
 * The random suffix from the default naming is preserved because turbo runs
 * many `plugboy build` processes in parallel, each loading the root
 * `plugboy.project.*`; a fixed name would collide across concurrent builds.
 */
export function resolveBundledConfigOutputFile(
  filepath: string,
  format: 'esm' | 'cjs',
): string {
  const ext = format === 'esm' ? 'mjs' : 'cjs';
  const base = path.parse(filepath).name;
  const id = crypto.randomBytes(6).toString('hex');
  const outDir = path.join(path.dirname(filepath), 'node_modules', '.plugboy');
  // `bundle-require` writes the bundled file directly and does not create its
  // parent directory, so ensure `.plugboy/` exists first.
  fs.mkdirSync(outDir, { recursive: true });
  return path.join(outDir, `${base}.bundled_${id}.${ext}`);
}

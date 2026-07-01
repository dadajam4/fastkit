import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

/**
 * Matches a trailing `//# sourceMappingURL=<file>.d.(m)ts.map` comment at the
 * end of a declaration file. Capture group 1 is the referenced map file name.
 *
 * @see {@link stripDanglingDTSSourceMaps}
 */
export const DANGLING_DTS_SOURCE_MAP_RE =
  /\r?\n\/\/# sourceMappingURL=([^\r\n]*\.d\.m?ts\.map)[ \t]*\r?\n?$/;

/**
 * Remove dangling declaration-map references from the emitted `.d.(m)ts` files
 * under `distDir`.
 *
 * tsdown (rolldown) appends a `//# sourceMappingURL=<file>.d.mts.map` comment to
 * every declaration file it emits, but does NOT emit the referenced
 * `.d.mts.map` itself. Consumers' editors/build tools then try to load a
 * declaration map that does not exist and report a resolution failure. Until
 * this is fixed upstream, strip the comment so shipped declarations don't point
 * at a missing map.
 *
 * As a safeguard it only strips the comment when the referenced map is genuinely
 * absent, so it becomes a no-op automatically if a future tsdown starts emitting
 * real declaration maps.
 *
 * Kept intentionally self-contained so this workaround can be removed in one
 * step: delete this file, its re-export from `../utils`, and the two call sites
 * (`Builder.build` and plugboy's own `tsdown.config.ts`, which self-builds via
 * bootstrap tsdown rather than through `Builder`).
 */
export async function stripDanglingDTSSourceMaps(
  distDir: string,
): Promise<void> {
  const dtsFiles = await glob(path.join(distDir, '**/*.{d.ts,d.mts}'));
  await Promise.all(
    dtsFiles.map(async (filePath) => {
      const dts = await fs.readFile(filePath, 'utf-8');
      const matched = dts.match(DANGLING_DTS_SOURCE_MAP_RE);
      if (!matched) return;

      const mapPath = path.join(path.dirname(filePath), matched[1]);
      const mapExists = await fs.access(mapPath).then(
        () => true,
        () => false,
      );
      if (mapExists) return;

      await fs.writeFile(
        filePath,
        dts.replace(DANGLING_DTS_SOURCE_MAP_RE, '\n'),
        'utf-8',
      );
    }),
  );
}

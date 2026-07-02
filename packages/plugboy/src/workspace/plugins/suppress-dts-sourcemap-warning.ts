import { Plugin } from '../../types';

/**
 * The rolldown-plugin-dts sub-plugin that drives declaration bundling through a
 * "fake JS" module. Its `renderChunk` returns a bare `"export { };"` string
 * (with no sourcemap) whenever a `.d.ts` chunk reduces to an empty body — e.g.
 * an entry composed solely of external re-exports. With sourcemaps enabled
 * (plugboy sets `sourcemap: true` for the JS output, which the dts pipeline
 * inherits), rolldown then emits a spurious `[SOURCEMAP_BROKEN]` warning for a
 * declaration file that is perfectly correct.
 */
const DTS_FAKE_JS_PLUGIN_NAME = 'rolldown-plugin-dts:fake-js';

/**
 * Suppress the harmless `[SOURCEMAP_BROKEN]` warning that rolldown-plugin-dts's
 * fake-js pass emits for empty declaration chunks.
 *
 * The filter is intentionally narrow — it only drops a `warn`-level
 * `SOURCEMAP_BROKEN` log **attributed to `rolldown-plugin-dts:fake-js`**. Real
 * sourcemap breakage on JS output (emitted by other plugins, or with no plugin
 * attribution) has a different `plugin` field and passes through untouched, so
 * genuine problems are still reported.
 *
 * The suppression is re-emitted at `debug` level so it can be traced by running
 * a build with a debug log level.
 *
 * TODO(upstream): remove this workaround once rolldown-plugin-dts returns a
 * valid (empty) sourcemap for empty chunks instead of a bare string. Track at
 * https://github.com/sxzz/rolldown-plugin-dts and, once fixed, bump the tsdown
 * (rolldown-plugin-dts) dependency range and delete this file, its re-export
 * from `./index`, and its registration in `workspace.ts`.
 */
export function createSuppressDtsSourcemapWarningPlugin(): Plugin {
  return {
    name: 'plugboy:suppress-dts-sourcemap-warning',
    onLog(level, log) {
      if (
        level === 'warn' &&
        log.code === 'SOURCEMAP_BROKEN' &&
        log.plugin === DTS_FAKE_JS_PLUGIN_NAME
      ) {
        this.debug(() => ({
          code: 'PLUGBOY_SUPPRESSED_DTS_SOURCEMAP_BROKEN',
          message: `Suppressed a spurious [SOURCEMAP_BROKEN] warning from ${DTS_FAKE_JS_PLUGIN_NAME} for an empty declaration chunk. Original message: ${log.message}`,
        }));
        return false;
      }
    },
  };
}

/**
 * Child-process driver for the dts SOURCEMAP_BROKEN integration test.
 *
 * Builds a fixture through tsdown directly (mirroring plugboy's `dts: true` +
 * `sourcemap: true` config) so the suppress plugin can be toggled and a
 * JS-sourcemap breaker injected. Run in a fresh process so rolldown's native
 * diagnostics (written to the OS stdout/stderr descriptors) are visible to the
 * parent. Usage: `tsx dts-sourcemap-driver.mts <dir> <outDir> <mode>`, where
 * mode is `suppress` | `none` | `js-breaker`.
 */
import { build } from 'tsdown';
import { createSuppressDtsSourcemapWarningPlugin } from '../../src/workspace/plugins/suppress-dts-sourcemap-warning';

const [, , dir, outDir, mode] = process.argv;
process.chdir(dir);

// Mutates a JS chunk's text without returning a sourcemap → rolldown emits a
// genuine SOURCEMAP_BROKEN attributed to THIS plugin (not fake-js).
const jsBreaker = {
  name: 'js-sourcemap-breaker',
  renderChunk(code: string) {
    return `${code}\n/* mutated without a map */`;
  },
};

const plugins = [];
if (mode === 'suppress' || mode === 'js-breaker') {
  plugins.push(createSuppressDtsSourcemapWarningPlugin());
}
if (mode === 'js-breaker') {
  plugins.push(jsBreaker);
}

await build({
  entry: { pkg: './src/index.ts' },
  outDir,
  dts: true,
  sourcemap: true,
  clean: true,
  plugins,
});

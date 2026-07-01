import { defineConfig } from 'tsdown';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const TS_EXT_RE = /\.ts$/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dependencies = fs
  .readdirSync(path.join(__dirname, 'src/dependencies'))
  .filter((file) => TS_EXT_RE.test(file));
const dependenciesEntry = Object.fromEntries(
  dependencies.map((file) => {
    const name = file.replace(TS_EXT_RE, '');
    return [`dependencies/${name}`, `src/dependencies/${file}`];
  }),
);

export default defineConfig({
  entry: {
    plugboy: 'src/index.ts',
    cli: 'src/cli.ts',
    'runtime-utils': 'src/runtime-utils/index.ts',
    ...dependenciesEntry,
  },
  format: ['esm'],
  dts: true,
  clean: true,
  // splitting: false,
  sourcemap: true,
  deps: {
    neverBundle: [
      /^@vanilla-extract/,
      /^@babel/,
      /^@vue/,
      'typescript',
      'postcss',
      'acorn',
      'magic-string',
    ],
  },
  // plugboy builds itself with bootstrap tsdown (not through its own `Builder`),
  // so the dangling `.d.mts.map` reference workaround has to run here too. This
  // is inlined (rather than importing `src/utils/dts-source-map.ts`) because the
  // tsdown config loader can't resolve extensionless relative TS imports. Keep
  // in sync with `stripDanglingDTSSourceMaps()` there — see that file for why
  // this exists and how to remove the whole workaround.
  async onSuccess() {
    const danglingSourceMapRe =
      /\r?\n\/\/# sourceMappingURL=([^\r\n]*\.d\.m?ts\.map)[ \t]*\r?\n?$/;
    const dtsFiles = await glob(
      path.join(__dirname, 'dist', '**/*.{d.ts,d.mts}'),
    );
    await Promise.all(
      dtsFiles.map(async (filePath) => {
        const dts = await fsp.readFile(filePath, 'utf-8');
        const matched = dts.match(danglingSourceMapRe);
        if (!matched) return;

        const mapPath = path.join(path.dirname(filePath), matched[1]);
        const mapExists = await fsp.access(mapPath).then(
          () => true,
          () => false,
        );
        if (mapExists) return;

        await fsp.writeFile(
          filePath,
          dts.replace(danglingSourceMapRe, '\n'),
          'utf-8',
        );
      }),
    );
  },
});

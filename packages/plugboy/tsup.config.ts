import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

const TS_EXT_RE = /\.ts$/;

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
    ...dependenciesEntry,
  },
  format: ['esm'],
  dts: true,
  clean: true,
  // splitting: false,
  sourcemap: true,
  outExtension: ({ format }) => ({
    js: `.mjs`,
  }),
  external: [/^@vanilla\-extract/, /^@babel/, /^@vue/, 'typescript'],
});

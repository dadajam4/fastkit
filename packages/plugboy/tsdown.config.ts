import { defineConfig } from 'tsdown';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  // outExtensions: ({ format }) => ({
  //   js: `.mjs`,
  // }),
  external: [
    /^@vanilla-extract/,
    /^@babel/,
    /^@vue/,
    'typescript',
    'postcss',
    'acorn',
    'magic-string',
  ],
});

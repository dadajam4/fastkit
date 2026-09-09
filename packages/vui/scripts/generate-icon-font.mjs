/**
 * Generate the default Material Design Icons webfont this package ships.
 *
 * The runtime only ever needs the *generated* artifacts -- a woff2, the CSS that
 * maps class names to code points, and the list of names. It never needs
 * `@mdi/svg` itself. Until this existed, every project on the default
 * configuration had to obtain those 7,447 SVGs (~31MB) at build time and run the
 * generator, and `@fastkit/icon-font-gen` would `pnpm add @mdi/svg` mid-build to
 * get them -- which fails outright in a `--prod` container image where the
 * devDependency was pruned.
 *
 * Generating here instead means the SVGs are a devDependency of this package and
 * of nothing else. Consumers get `dist/icon-font/`, and generation becomes
 * opt-in, for projects that supply their own SVGs.
 *
 * Runs after `plugboy build` (and after `plugboy stub`), writing into `dist`,
 * because `dist/**` is what Turbo caches -- generating into `public/` instead
 * would feed the build's own `inputs` and make its hash flip on every run.
 */
import path from 'node:path';
import module from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { generateEntry } from '@fastkit/icon-font-gen';

const require = module.createRequire(import.meta.url);
const PKG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DEST = path.join(PKG_DIR, 'dist', 'icon-font');

/**
 * The module the generated augmentation targets.
 *
 * `@fastkit/icon-font` -- the package that declares `IconNameMap` -- rather than
 * `@fastkit/vui`: this file ships *inside* vui, so it resolves the same physical
 * copy vui does, and naming the declaring package directly needs no re-export to
 * follow. (`@fastkit/vite-plugin-vui` generates against `@fastkit/vui` for the
 * opposite reason: its output lands in the consumer's project, where only what
 * the project declares resolves.)
 */
const RUNTIME_MODULE = '@fastkit/icon-font';

const MDI_DIR = path.dirname(require.resolve('@mdi/svg/package.json'));
/**
 * Apache-2.0 requires the recipient be given a copy of the License itself
 * (section 4(a)). `@mdi/svg` ships only the Pictogrammers summary, which points
 * at apache.org rather than reproducing the terms, so the full text is kept
 * here and both files are shipped alongside the font.
 */
const APACHE_LICENSE_FILE = path.join(
  PKG_DIR,
  'scripts',
  'licenses',
  'Apache-2.0.txt',
);
const MDI_VERSION = JSON.parse(
  readFileSync(path.join(MDI_DIR, 'package.json'), 'utf-8'),
).version;

/**
 * Font metrics for the MDI source set.
 *
 * The same values `@fastkit/icon-font-gen` applies to its `"@mdi"` sentinel, so
 * the font shipped here is identical to what a project generating from `@mdi`
 * would have produced for itself.
 */
const ENTRY = {
  src: path.join(MDI_DIR, 'svg'),
  name: 'mdi',
  fontName: 'mdi-icon',
  prefix: 'mdi-',
  dest: DEST,
  display: 'block',
  fontHeight: 512,
  descent: 64,
};

const BANNER = `/**
 * This is auto generated file.
 * Do not edit !!!
 *
 * @see: https://github.com/dadajam4/fastkit/tree/main/packages/vui/scripts/generate-icon-font.mjs
 */`;

const NOTICE = `# Material Design Icons

The files in this directory are generated from [\`@mdi/svg\`](https://www.npmjs.com/package/@mdi/svg)
version ${MDI_VERSION}, by the [Pictogrammers](https://pictogrammers.com/) icon group.

## Modifications

Per Apache-2.0 section 4(b), this is a modified form of that work: the individual
SVG files were converted into a single woff2 webfont, each glyph assigned a code
point in the Private Use Area, and a stylesheet generated that maps
\`icon-mdi-<name>\` class names onto those code points. No glyph artwork was
altered.

\`@mdi/svg\` ships no \`NOTICE\` file, so section 4(d) does not apply.

## License

The font and the icons it contains are distributed under the Apache License 2.0.
\`LICENSE\` in this directory is the full text of that license;
\`LICENSE.pictogrammers\` is the license file \`@mdi/svg\` itself ships.

\`@fastkit/vui\` itself remains MIT-licensed. Only the contents of this directory
carry the license above.

## Trademarks

The set includes brand and logo marks. Apache-2.0 grants rights in copyright, not
in trademark: brand icons are trademarks of their respective owners, and their
inclusion does not imply endorsement.
`;

/**
 * `.hash` is `@fastkit/icon-font-gen`'s skip marker, and it weighs ~515KB for a
 * source tree this size -- far too much to publish, and meaningless in `dist`
 * anyway since `plugboy build` empties the directory first. Removing it before
 * and after leaves generation unconditional (~5s, and only on a Turbo cache
 * miss) and `dist` free of build state.
 */
const HASH_FILE = path.join(DEST, '.hash');

function toNameList(result) {
  const names = [];
  for (const { metadata } of result.glyphsData) {
    if (!metadata?.unicode) continue;
    names.push(`${ENTRY.prefix}${metadata.name}`);
  }
  return names.sort();
}

function renderRuntime(names) {
  return `${BANNER}
import { registerIconNames } from '${RUNTIME_MODULE}';

export const ICON_NAMES = registerIconNames([
${names.map((name) => `  '${name}',`).join('\n')}
]);
`;
}

/**
 * The declaration is emitted as a module (it imports and re-exports), not a
 * script: in a script `declare module '…'` declares a *new* ambient module that
 * shadows the real one, and the names would never reach the `IconNameMap` that
 * `@fastkit/icon-font` declares.
 */
function renderTypes(names) {
  return `${BANNER}
import type { IconName, IconNameMap } from '${RUNTIME_MODULE}';

declare module '${RUNTIME_MODULE}' {
  export interface IconNameMap {
${names.map((name) => `    '${name}': true;`).join('\n')}
  }
}

export declare const ICON_NAMES: IconName[];

export type { IconName, IconNameMap };
`;
}

async function main() {
  await fs.mkdir(DEST, { recursive: true });
  await fs.rm(HASH_FILE, { force: true });

  const { result } = await generateEntry(ENTRY, RUNTIME_MODULE);
  if (!result) {
    throw new Error(
      `Icon font generation produced no result for ${ENTRY.src}. ` +
        'Is @mdi/svg installed?',
    );
  }

  const names = toNameList(result);

  await Promise.all([
    // `generateEntry` writes a `.ts` meant for a project's source tree. This
    // package publishes built output, so replace it with the `.mjs`/`.d.mts`
    // pair the exports map points at.
    fs.rm(path.join(DEST, 'mdi.ts'), { force: true }),
    fs.rm(HASH_FILE, { force: true }),
    fs.writeFile(path.join(DEST, 'index.mjs'), renderRuntime(names)),
    fs.writeFile(path.join(DEST, 'index.d.mts'), renderTypes(names)),
    // Named so the stylesheet a project imports (`@fastkit/vui/icon-font.css`)
    // stays a stable specifier while what backs it can change.
    fs.writeFile(
      path.join(DEST, 'index.css'),
      `/* stylelint-disable */\n@import './mdi.css';\n`,
    ),
    fs.copyFile(APACHE_LICENSE_FILE, path.join(DEST, 'LICENSE')),
    fs.copyFile(
      path.join(MDI_DIR, 'LICENSE'),
      path.join(DEST, 'LICENSE.pictogrammers'),
    ),
    fs.writeFile(path.join(DEST, 'NOTICE.md'), NOTICE),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `[vui] icon-font: ${names.length} icons from @mdi/svg@${MDI_VERSION}`,
  );
}

await main();

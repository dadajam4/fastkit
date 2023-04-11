import fs from 'fs-extra';
import path from 'node:path';
import chokidar, { FSWatcher } from 'chokidar';
import { EV } from '@fastkit/ev';
import {
  IconFontOptions,
  IconFontEntry,
  RawIconFontEntry,
  resolveRawIconFontEntry,
  ICON_FONT_FORMATS,
  IconFontFormat,
  ICON_FONT_FORMAT_MAP,
} from './schemes';
import { HashComparator } from '@fastkit/node-util';
import { UnPromisify } from '@fastkit/helpers';
import { logger } from './logger';
import type webfont from 'webfont';

export type IconFontEntryResult = {
  entry: IconFontEntry;
  result?: UnPromisify<ReturnType<typeof webfont>>;
};

export const DEFAULT_OPTIONS: Partial<IconFontEntry> = {
  formats: ['woff2'],
  fixedWidth: true,
  normalize: true,
};

const BANNER = `
/**
 * This is auto generated file.
 * Do not edit !!!
 *
 * @see: https://github.com/dadajam4/fastkit/tree/main/packages/icon-font-gen
 */
`.trim();

export function mergeDefaults(entry: IconFontEntry): IconFontEntry {
  return {
    ...DEFAULT_OPTIONS,
    ...entry,
  };
}

async function generateTS(entry: IconFontEntry, ids: string[]) {
  const code = `
/* eslint-disable */
// @ts-nocheck
${BANNER}
import type { IconName, IconNameMap } from '@fastkit/icon-font';
import { registerIconNames } from '@fastkit/icon-font';
declare module "@fastkit/icon-font" {
  export interface IconNameMap {
${ids.map((id) => `    '${id}': true,`).join('\n')}
  }
}
export const ICON_NAMES = registerIconNames([
  ${ids.map((id) => `'${id}'`).join(',\n  ')}
]);
export type { IconName, IconNameMap } from '@fastkit/icon-font';
  `.trim();
  const fileName = `${entry.name || 'icons'}.ts`;
  const dest = path.resolve(entry.dest, fileName);
  await fs.writeFile(dest, code);
  return {
    fileName,
    dest,
    code,
  };
}

export async function generateEntry(
  entry: IconFontEntry,
): Promise<IconFontEntryResult> {
  const options = mergeDefaults(entry);

  // @TODO support empty prefix
  // const namePrefix = options.name;
  const cssPrefix = `icon-${options.prefix}`;

  const hash = new HashComparator(options.src, options.dest);
  const srcHash = await hash.hasChanged();
  if (!srcHash) {
    logger.info(`Has not chaged files. Skip process. >>> ${options.src}`);
    return { entry };
  }

  await fs.ensureDir(options.dest);

  const { webfont } = await import('webfont');

  // const { startUnicode = 0xea01 } = options;
  const { startUnicode = 0xba01 } = options;

  let i = startUnicode;

  const result = await webfont({
    files: options.src,
    fontName: options.fontName,
    formats: options.formats,
    fixedWidth: options.fixedWidth,
    centerHorizontally: options.centerHorizontally,
    normalize: options.normalize,
    fontHeight: options.fontHeight,
    round: options.round,
    descent: options.descent,
    addHashInFontUrl: options.addHashInFontUrl,
    glyphTransformFn: (obj) => {
      const char = String.fromCodePoint(i);
      obj.unicode = [char];
      i++;
      return obj;
    },
  });

  const buildedFormats: { format: IconFontFormat; code: string | Buffer }[] =
    [];
  ICON_FONT_FORMATS.forEach((format) => {
    const code = result[format];
    if (code) {
      buildedFormats.push({ format, code });
    }
  });

  await Promise.all(
    buildedFormats.map(({ format, code }) => {
      return fs.writeFile(
        path.join(options.dest, `${options.name}.${format}`),
        code,
      );
    }),
  );

  const glyphs: { name: string; code: string }[] = [];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  result.glyphsData!.forEach(({ metadata }) => {
    if (!metadata) return;
    const { name, unicode } = metadata;
    if (!unicode) {
      return;
    }

    const code = unicode[0].charCodeAt(0).toString(16);
    glyphs.push({ name, code });
  });

  const urlPath = options.absolutePath ? options.dest : '.';
  const hashSuffix = options.addHashInFontUrl ? `?${Date.now()}` : '';
  ICON_FONT_FORMAT_MAP;
  const src = buildedFormats
    .map(({ format }) => {
      return `url("${urlPath}/${options.name}.${format}${hashSuffix}") format("${ICON_FONT_FORMAT_MAP[format]}")`;
    })
    .join(',');

  const cssCode = `/* stylelint-disable */
@font-face {
  font-family: "${options.fontName}";
  font-display: block;
  font-style: normal;
  font-weight: 400;
  src: ${src};
}

i[class^="${cssPrefix}"]:before, i[class*=" ${cssPrefix}"]:before {
  font-family: ${options.fontName} !important;
  font-style: normal;
  font-weight: normal !important;
  font-variant: normal;
  text-transform: none;
  text-rendering: auto;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
${glyphs
  .map(({ name, code }) => {
    return `
.${cssPrefix}${name}:before { content: "\\${code}"; }
  `;
  })
  .join('\n')}
  `;
  await fs.writeFile(path.join(options.dest, `${options.name}.css`), cssCode);

  // const prefix = options.prefix ? `${options.prefix}-` : '';
  const ids = glyphs.map(({ name }) => `${options.prefix}${name}`);
  await generateTS(options, ids);
  await hash.commit(srcHash);
  return {
    entry,
    result,
  };
}

export async function generateIndex(dest: string, entries: IconFontEntry[]) {
  const names = entries.map(({ name }) => name);
  const tsCode = `
/* eslint-disable */
// @ts-nocheck
import './index.css';
${BANNER}
${names
  .map(
    (name, index) =>
      // `import { IconName as IconName_${index}, IconNameMap as IconNameMap_${index} } from './${name}/${name}';`,
      `import './${name}/${name}';`,
  )
  .join('\n')}
export type { IconName } from '@fastkit/icon-font';
export { ICON_NAMES } from '@fastkit/icon-font';
  `.trim();
  const tsDest = path.join(dest, 'index.ts');
  await fs.writeFile(tsDest, tsCode);

  const cssCode = `
/* stylelint-disable */
${BANNER}
${names.map((name) => `@import './${name}/${name}.css';`).join('\n')}
  `.trim();
  const cssDest = path.join(dest, 'index.css');
  await fs.writeFile(cssDest, cssCode);
}

export async function generate(opts: IconFontOptions) {
  await fs.emptyDir(opts.dest);
  const results = await Promise.all(
    opts.entries.map((entry) =>
      resolveRawIconFontEntry(opts.dest, entry).then((entry) =>
        generateEntry(entry),
      ),
    ),
  );
  const entries = results.map(({ entry }) => entry);
  await generateIndex(opts.dest, entries);
}

export class IconFontRunnerItem extends EV<{
  build: IconFontEntryResult;
}> {
  readonly entry: RawIconFontEntry;
  readonly ctx: IconFontRunner;
  private _resolveEntryPromise?: Promise<IconFontEntry>;
  private _watcher: FSWatcher | null = null;
  watchMode: boolean;

  // get name() {
  //   return this.entry.name;
  // }

  constructor(ctx: IconFontRunner, entry: RawIconFontEntry, watch = false) {
    super();
    this.ctx = ctx;
    this.entry = entry;
    this.watchMode = watch;
    this.build = this.build.bind(this);
  }

  async run() {
    const result = await this.build();
    if (this.watchMode && !this._watcher) {
      const watchDir = path.resolve(this.entry.src);
      this._watcher = chokidar.watch(watchDir, { ignoreInitial: true });
      this._watcher.on('all', this.build);
    }
    return result;
  }

  resolveEntry() {
    if (!this._resolveEntryPromise) {
      this._resolveEntryPromise = resolveRawIconFontEntry(
        this.ctx.dest,
        this.entry,
      );
    }
    return this._resolveEntryPromise;
  }

  async build() {
    const entry = await this.resolveEntry();
    const result = await generateEntry(entry);
    this.emit('build', result);
    return { entry };
  }

  destroy() {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }
    this.offAll();
    if (this.ctx) {
      delete (this as any).ctx;
    }
  }
}

export class IconFontRunner extends EV<{
  build: {
    item: IconFontRunnerItem;
    result: IconFontEntryResult;
  };
}> {
  readonly items: IconFontRunnerItem[] = [];
  readonly dest: string;
  // private _opts: IconFontOptions;
  // private entries: IconFontEntry[] = [];

  constructor(opts: IconFontOptions, watch?: boolean) {
    super();

    // this._opts = opts;
    this.dest = opts.dest;
    // this.entries = opts.entries.map((entry) =>
    //   resolveRawIconFontEntry(this.outputDir, entry),
    // );

    opts.entries.forEach((entry) => {
      const item = new IconFontRunnerItem(this, entry, watch);
      item.on('build', (result) => {
        this.emit('build', { item, result });
      });
      this.items.push(item);
    });
  }

  async buildIndex() {
    const entries = await Promise.all(
      this.items.map((item) => item.resolveEntry()),
    );
    return generateIndex(this.dest, entries);
  }

  async run() {
    await fs.ensureDir(this.dest);
    await Promise.all([
      this.buildIndex(),
      Promise.all(this.items.map((item) => item.run())),
    ]);
  }

  destroy() {
    this.items.forEach((item) => item.destroy());
    this.items.length = 0;
    this.offAll();
    delete (this as any)._opts;
  }
}

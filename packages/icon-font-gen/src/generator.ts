import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
import fs from 'fs-extra';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { EV } from '@fastkit/ev';
import { RawIconFontOptions, IconFontEntry, SvgOptions } from './schemes';

export const DEFAULT_SVG_OPTIONS: Partial<SvgOptions> = {
  fixedWidth: true,
};

export const DEFAULT_OPTIONS: Partial<IconFontEntry> = {
  fontTypes: [FontAssetType.EOT, FontAssetType.WOFF2, FontAssetType.WOFF],
  assetTypes: [OtherAssetType.CSS, OtherAssetType.HTML, OtherAssetType.JSON],
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
  const { formatOptions = {} } = entry;

  return {
    ...DEFAULT_OPTIONS,
    ...entry,
    formatOptions: {
      svg: {
        ...DEFAULT_SVG_OPTIONS,
        ...formatOptions.svg,
      },
      ...formatOptions,
    },
  };
}

async function generateTS(entry: IconFontEntry, ids: string[]) {
  const code = `
/* eslint-disable */
// @ts-nocheck
${BANNER}
export type Icon = ${ids.map((id) => `'${id}'`).join(' | ')};
export const ICONS = [${ids.map((id) => `'${id}'`).join(', ')}] as const;
  `.trim();
  const fileName = `${entry.name || 'icons'}.ts`;
  const dest = path.resolve(entry.outputDir, fileName);
  await fs.writeFile(dest, code);
  return {
    fileName,
    dest,
    code,
  };
}

export async function generateEntry(entry: IconFontEntry) {
  const options = mergeDefaults(entry);
  await fs.emptyDir(entry.outputDir);
  const result = await generateFonts(options);
  const ids = Object.keys(result.codepoints);
  await generateTS(entry, ids);
  return result;
}

export async function generate(opts: RawIconFontOptions) {
  if (!Array.isArray(opts)) {
    opts = [opts];
  }

  return Promise.all(opts.map((entry) => generateEntry(entry)));
}

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export class IconFontRunnerItem extends EV<{
  build: UnPromisify<ReturnType<typeof generateEntry>>;
}> {
  readonly entry: IconFontEntry;
  private _watcher: FSWatcher | null = null;
  watchMode: boolean;

  constructor(entry: IconFontEntry, watch = false) {
    super();
    this.entry = entry;
    this.watchMode = watch;
    this.build = this.build.bind(this);
  }

  async run() {
    const result = await this.build();
    if (this.watchMode && !this._watcher) {
      const watchDir = path.resolve(this.entry.inputDir);
      this._watcher = chokidar.watch(watchDir, { ignoreInitial: true });
      this._watcher.on('all', this.build);
    }
    return result;
  }

  async build() {
    const result = await generateEntry(this.entry);
    this.emit('build', result);
    return result;
  }

  destroy() {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }
    this.offAll();
  }
}

export class IconFontRunner extends EV<{
  build: {
    item: IconFontRunnerItem;
    result: UnPromisify<ReturnType<typeof generateEntry>>;
  };
}> {
  readonly items: IconFontRunnerItem[] = [];

  constructor(opts: RawIconFontOptions, watch?: boolean) {
    super();

    if (!Array.isArray(opts)) {
      opts = [opts];
    }
    opts.forEach((entry) => {
      const item = new IconFontRunnerItem(entry, watch);
      item.on('build', (result) => {
        this.emit('build', { item, result });
      });
      this.items.push(item);
    });
  }

  run() {
    return Promise.all(this.items.map((item) => item.run()));
  }

  destroy() {
    this.items.forEach((item) => item.destroy());
    this.offAll();
  }
}

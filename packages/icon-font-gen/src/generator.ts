import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
import fs from 'fs-extra';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { EV } from '@fastkit/ev';
import {
  IconFontOptions,
  IconFontEntry,
  SvgOptions,
  resolveRawIconFontEntry,
} from './schemes';
import { installPackage, HashComparator } from '@fastkit/node-util';
import { logger } from './logger';

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
import { IconName, IconNameMap, registerIconNames } from '@fastkit/icon-font';
declare module "@fastkit/icon-font" {
  export interface IconNameMap {
${ids.map((id) => `    '${id}': true,`).join('\n')}
  }
}
registerIconNames([
  ${ids.map((id) => `'${id}'`).join(',\n  ')}
]);
export type { IconName, IconNameMap } from '@fastkit/icon-font';
export { ICON_NAMES } from '@fastkit/icon-font';
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

  // mdi support
  if (options.inputDir === '@mdi') {
    const installedDir = await findOrInstallMDI();
    options.inputDir = path.join(installedDir, 'svg');
    if (options.descent == null) {
      options.descent = 42;
    }
    if (options.prefix == null) {
      options.prefix = 'mdi';
    }
    if (options.name == null) {
      options.name = 'mdi';
    }
  }

  const hash = new HashComparator(options.inputDir, options.outputDir);
  const srcHash = await hash.hasChanged();
  if (!srcHash) {
    logger.info(`Has not chaged files. Skip process. >>> ${options.inputDir}`);
    return;
  }

  await fs.ensureDir(options.outputDir);
  const result = await generateFonts(options);
  const prefix = options.prefix ? `${options.prefix}-` : '';
  const ids = Object.keys(result.codepoints).map((key) => `${prefix}${key}`);
  await generateTS(options, ids);
  await hash.commit(srcHash);
  return result;
}

export async function generateIndex(opts: IconFontOptions) {
  const { outputDir } = opts;
  const entries = opts.entries.map((entry) =>
    resolveRawIconFontEntry(opts.outputDir, entry),
  );
  const names = entries.map(({ name }) => name);
  const tsCode = `
/* eslint-disable */
// @ts-nocheck
import './index.css';
${BANNER}
${names
  .map(
    (name, index) =>
      `import { IconName as IconName_${index}, IconNameMap as IconNameMap_${index} } from './${name}/${name}';`,
  )
  .join('\n')}
export type { IconName } from '@fastkit/icon-font';
export { ICON_NAMES } from '@fastkit/icon-font';
  `.trim();
  const tsDest = path.join(outputDir, 'index.ts');
  await fs.writeFile(tsDest, tsCode);

  const cssCode = `
/* stylelint-disable */
${BANNER}
${names.map((name) => `@import './${name}/${name}.css';`).join('\n')}
  `.trim();
  const cssDest = path.join(outputDir, 'index.css');
  await fs.writeFile(cssDest, cssCode);
}

export async function generate(opts: IconFontOptions) {
  await fs.emptyDir(opts.outputDir);
  return Promise.all([
    generateIndex(opts),
    Promise.all(
      opts.entries.map((entry) =>
        generateEntry(resolveRawIconFontEntry(opts.outputDir, entry)),
      ),
    ),
  ]);
}

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export class IconFontRunnerItem extends EV<{
  build: UnPromisify<ReturnType<typeof generateEntry>>;
}> {
  readonly entry: IconFontEntry;
  private _watcher: FSWatcher | null = null;
  watchMode: boolean;

  get name() {
    return this.entry.name;
  }

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
  readonly outputDir: string;
  private _opts: IconFontOptions;
  private entries: IconFontEntry[] = [];

  constructor(opts: IconFontOptions, watch?: boolean) {
    super();

    this._opts = opts;
    this.outputDir = opts.outputDir;
    this.entries = opts.entries.map((entry) =>
      resolveRawIconFontEntry(this.outputDir, entry),
    );

    this.entries.forEach((entry) => {
      const item = new IconFontRunnerItem(entry, watch);
      item.on('build', (result) => {
        this.emit('build', { item, result });
      });
      this.items.push(item);
    });
  }

  buildIndex() {
    return generateIndex(this._opts);
  }

  async run() {
    await fs.ensureDir(this.outputDir);
    await Promise.all([
      this.buildIndex(),
      Promise.all(this.items.map((item) => item.run())),
    ]);
  }

  destroy() {
    this.items.forEach((item) => item.destroy());
    this.entries = [];
    this.offAll();
    delete (this as any)._opts;
  }
}

function findOrInstallMDI() {
  return installPackage('@mdi/svg', { dev: true });
}

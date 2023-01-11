import fs from 'fs-extra';
import path from 'node:path';
import chokidar, { FSWatcher } from 'chokidar';
import { EV } from '@fastkit/ev';
import { SpriteImagesOptions, SpriteImagesSettings } from './schemes';
import { logger } from './logger';
import module from 'node:module';
const require = module.createRequire(import.meta.url);

const Spritesmith = require('spritesmith');

const SETTINGS_FILENAME = '.settings.json';

const BANNER = `
/**
 * This is auto generated file.
 * Do not edit !!!
 *
 * @see: https://github.com/dadajam4/fastkit/tree/main/packages/sprite-images
 */
`.trim();

export async function generate(opts: SpriteImagesOptions) {
  let { src, dest, relativePath = './' } = opts;
  src = path.resolve(src);
  dest = path.resolve(dest);
  if (relativePath) {
    relativePath = `${relativePath}/`.replace(/\/\/$/, '/');
  }
  const files = await fs.readdir(src);
  const dirs = (
    await Promise.all(
      files.map((name) => {
        const fullPath = path.join(src, name);
        return fs.stat(fullPath).then((stat) => {
          return {
            stat,
            name,
            fullPath,
          };
        });
      }),
    )
  ).filter((dir) => dir.stat.isDirectory());

  await fs.emptyDir(dest);

  await Promise.all(
    dirs.map(async (dir) => {
      let settingsPath;
      const files = (await fs.readdir(dir.fullPath))
        .filter((name) => {
          if (name === SETTINGS_FILENAME) {
            settingsPath = path.join(dir.fullPath, name);
          }
          return /\.png$/.test(name);
        })
        .map((name) => {
          return {
            name,
            fullPath: path.join(dir.fullPath, name),
          };
        });

      const sprites = files.map((file) => file.fullPath);
      const _settings: SpriteImagesSettings = settingsPath
        ? await fs.readJson(settingsPath)
        : {};

      await new Promise<void>((resolve, reject) => {
        Spritesmith.run(
          { src: sprites, ..._settings },
          async function handleResult(err: any, result: any) {
            if (err) return reject(err);

            try {
              const { image, properties, coordinates } = result;

              const DEST = path.join(dest, dir.name);
              const IMAGE_FILE_NAME = `${dir.name}-sprites.png`;
              const IMAGE_DEST = path.join(DEST, IMAGE_FILE_NAME);
              const SCSS_DEST = path.join(DEST, `${dir.name}-sprites.scss`);
              const TS_DEST = path.join(DEST, `index.ts`);
              // const IMPORT_RELATIVE_PATH = `${relativePath}${dir.name}`;
              const fileInfo = {
                name: dir.name,
                // path: IMPORT_RELATIVE_PATH,
                imagePath: `${relativePath}${IMAGE_FILE_NAME}`,
                ...properties,
                sprites: [],
              };

              const rows = [];
              const backgroundWidth = `${properties.width}px`;
              const backgroundHeight = `${properties.height}px`;
              const backgroundImage = `url(${relativePath}${IMAGE_FILE_NAME})`;
              rows.push(`$${dir.name}-sprite-width: ${backgroundWidth};`);
              rows.push(`$${dir.name}-sprite-height: ${backgroundHeight};`);
              rows.push(`$${dir.name}-sprite-image: ${backgroundImage};`);

              const dictRows: string[] = [];

              Object.keys(coordinates).forEach((fullPath) => {
                const info = coordinates[fullPath];
                const key = path.basename(fullPath, '.png');

                fileInfo.sprites.push({
                  name: key,
                  ...info,
                });

                function px(ammount: number, vec = 1) {
                  return ammount ? `${ammount * vec}px` : '0';
                }

                const width = `${px(info.width)}`;
                const height = `${px(info.height)}`;
                const backgroundPositionX = `${px(info.x, -1)}`;
                const backgroundPositionY = `${px(info.y, -1)}`;
                const row = `  ${key}: (x: ${backgroundPositionX}, y: ${backgroundPositionY}, width: ${width}, height: ${height}),`;
                dictRows.push(row);
                return key;
              });

              const dict = `$${dir.name}-sprite: (\n${dictRows.join('\n')}\n);`;

              rows.push(dict);

              rows.push(
                `\n@mixin ${dir.name}-sprite-base() {\n  background-repeat: no-repeat;\n  overflow: hidden;\n  background-image: $${dir.name}-sprite-image;\n}`,
              );

              rows.push(
                `\n@mixin ${dir.name}-sprite-background-size($scale: 1) {\n  background-size: $${dir.name}-sprite-width * $scale $${dir.name}-sprite-height * $scale;\n}`,
              );

              rows.push(
                `\n@mixin ${dir.name}-sprite-background-position($name, $scale: 1) {\n  $info: map-get($${dir.name}-sprite, $name);\n\n  background-position: map-get($info, x) * $scale map-get($info, y) * $scale;\n\n}`,
              );

              rows.push(
                `\n@mixin ${dir.name}-sprite-size($name, $scale: 1) {\n  $info: map-get($${dir.name}-sprite, $name);\n\n  width: map-get($info, width) * $scale;\n  height: map-get($info, height) * $scale;\n}`,
              );

              rows.push(
                `\n@mixin ${dir.name}-sprite($name, $scale: 1) {\n  @include ${dir.name}-sprite-base;\n  @include ${dir.name}-sprite-background-size($scale);\n  @include ${dir.name}-sprite-background-position($name: $name, $scale: $scale);\n  @include ${dir.name}-sprite-size($name: $name, $scale: $scale);\n}`,
              );

              rows.push(
                `\n@mixin ${dir.name}-sprite-dump($prefix, $scale: 1) {\n  @each $name, $info in $${dir.name}-sprite {\n    #{$prefix}#{$name} {\n      @include ${dir.name}-sprite($name: $name, $scale: $scale);\n    }\n  }\n}`,
              );

              const scss = `/* stylelint-disable */\n${BANNER}\n${rows.join(
                '\n',
              )}`;

              const ts = `/* eslint-disable */\n// @ts-nocheck\n${BANNER}\nconst spritesInfo = ${JSON.stringify(
                fileInfo,
                null,
                2,
              ).replace(/"/g, "'")} as const;\n\nexport default spritesInfo;\n`;

              await fs.emptyDir(DEST);
              await Promise.all([
                fs.writeFile(IMAGE_DEST, image),
                fs.writeFile(SCSS_DEST, scss, 'utf-8'),
                fs.writeFile(TS_DEST, ts, 'utf-8'),
              ]);
              logger.success(`created ${dir.name} sprites:`, DEST);
              resolve();
            } catch (_err) {
              reject(_err);
            }
          },
        );
      });
    }),
  );

  const rows = dirs.map((dir) => {
    return `@use './${dir.name}/${dir.name}-sprites.scss' as *;`;
  });

  const DEST = path.join(dest, 'sprites.scss');
  const scss = `${BANNER}\n\n${rows.join('\n')}`;

  await fs.writeFile(DEST, scss, 'utf-8');

  logger.success('created sprites index:', DEST);
}

export class SpriteImagesRunner extends EV<{
  build: void;
}> {
  readonly entry: SpriteImagesOptions;
  private _watcher: FSWatcher | null = null;

  constructor(entry: SpriteImagesOptions) {
    super();
    this.entry = entry;
    this.build = this.build.bind(this);
  }

  async run() {
    const result = await this.build();
    if (!this._watcher) {
      const watchDir = path.resolve(this.entry.src);
      this._watcher = chokidar.watch(watchDir, { ignoreInitial: true });
      this._watcher.on('all', this.build);
    }
    return result;
  }

  async build() {
    const result = await generate(this.entry);
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

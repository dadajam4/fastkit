import path from 'node:path';
// import _imagemin from 'imagemin';
// import imageminWebp from 'imagemin-webp';
// const imageminWebp = require('imagemin-webp');
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import { createProcessor } from '../helpers';
import { logger } from '../logger';
import { UpdateInfo } from '../schemes';
// const _imagemin = require('imagemin');

const targetExtentions = ['jpg', 'png'];
const targetExtentionsRe = new RegExp(`.(${targetExtentions.join('|')})$`, 'i');

interface MyDir {
  src: string;
  dest: string;
  updates: UpdateInfo[];
}

export const imagemin = createProcessor({
  name: 'imagemin',
  match(update: UpdateInfo) {
    return targetExtentionsRe.test(update.src);
  },
  async proc(updates: UpdateInfo[]) {
    const dirs: MyDir[] = [];

    updates.forEach((update) => {
      const { dir: src } = path.parse(update.src);
      let dir = dirs.find((d) => d.src === src);
      if (!dir) {
        const { dir: dest } = path.parse(update.dest);
        dir = {
          src,
          dest,
          updates: [],
        };
        dirs.push(dir);
      }
      dir.updates.push(update);
    });

    const total = dirs.length;

    for (const dir of dirs) {
      const progress = dirs.indexOf(dir) + 1;
      logger.info(
        `[imagemin]: (${progress} / ${total}) start -> ${dir.src} ${dir.updates.length} files`,
      );

      const images = dir.updates.map((update) => update.src);

      const { default: _imagemin } = await import('imagemin');
      // import _imagemin from 'imagemin';

      await Promise.all([
        _imagemin(images, {
          destination: dir.dest,
          plugins: [imageminPngquant(), imageminMozjpeg()],
        }),
      ]).then((results) => {
        logger.success(`  suceeded`);
        return results;
      });
    }
  },
});

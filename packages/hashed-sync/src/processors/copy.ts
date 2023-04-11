import fs from 'fs-extra';
import { UpdateInfo } from '../schemes';
import { createProcessor } from '../helpers';
import { logger } from '../logger';

export const copy = createProcessor({
  name: 'copy',
  match() {
    return true;
  },

  async proc(updates: UpdateInfo[]) {
    logger.info(`[copy]: start -> ${updates.length} files`);
    await Promise.all(
      updates.map((update) => {
        return fs.copy(update.src, update.dest, {
          preserveTimestamps: true,
        });
      }),
    );
    logger.success(`  suceeded`);
  },
});

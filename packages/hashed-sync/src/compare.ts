import path from 'node:path';
import fs from 'fs-extra';
import { hashElement, HashElementNode } from 'folder-hash';
import { CompareResult, SyncItem, UpdateInfo, UpdateType } from './schemes';

export const META_DIR_NAME = '.sync';

export const HISTORY_FILE_NAME = 'history.json';

const excludesRe = /\.DS_Store$/;

export async function compare(
  srcRoot: string,
  dest: string,
): Promise<CompareResult> {
  const metaDir = path.join(dest, META_DIR_NAME);
  const historyPath = path.join(metaDir, HISTORY_FILE_NAME);
  const before: SyncItem[] = (await fs.pathExists(historyPath))
    ? await fs.readJson(historyPath)
    : [];

  const hash = await hashElement(srcRoot);
  const tick = (
    rows: HashElementNode[],
    prefix = '',
    bucket: SyncItem[] = [],
  ) => {
    rows.forEach((row) => {
      const src = path.join(prefix, row.name);
      if (excludesRe.test(src)) return;

      if (row.children) {
        tick(row.children, src, bucket);
      } else {
        const _dest = src.replace(srcRoot, dest);
        bucket.push({
          src,
          dest: _dest,
          hash: row.hash,
        });
      }
    });
    return bucket;
  };

  const current: SyncItem[] = tick(hash.children || [hash], srcRoot);
  const addFiles: SyncItem[] = [];
  const updateFiles: SyncItem[] = [];
  const removeFiles: SyncItem[] = [];

  current.forEach((item) => {
    const { src, hash } = item;
    const same = before.find((i) => i.src === src);
    if (!same) {
      addFiles.push(item);
    } else if (hash !== same.hash) {
      updateFiles.push(item);
    }
  });

  before.forEach((item) => {
    const { src } = item;
    if (!current.find((i) => i.src === src)) {
      removeFiles.push(item);
    }
  });

  const removes: UpdateInfo[] = removeFiles.map((item) => ({
    src: item.src,
    dest: item.dest,
    type: UpdateType.REMOVE,
  }));

  const updates: UpdateInfo[] = [
    ...addFiles.map((item) => ({
      src: item.src,
      dest: item.dest,
      type: UpdateType.ADD,
    })),
    ...updateFiles.map((item) => ({
      src: item.src,
      dest: item.dest,
      type: UpdateType.UPDATE,
    })),
  ];

  const updateInformations = [...updates, ...removes];

  return {
    src: srcRoot,
    dest,
    metaDir,
    historyPath,
    current,
    before,
    removes,
    updates,
    updateInformations,
  };
}

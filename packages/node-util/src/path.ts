import path from 'path';
import fs from 'fs-extra';

export async function resolveEntryPoint(
  rawEntryPoint: string,
  extensions: string | string[] = ['ts', 'js'],
) {
  const { ext } = path.parse(rawEntryPoint);
  if (ext) {
    return rawEntryPoint;
  }
  if (await pathExists(rawEntryPoint, 'dir')) {
    for (const _ext of extensions) {
      const indexPath = path.join(rawEntryPoint, `index.${_ext}`);
      if (await pathExists(indexPath, 'file')) {
        return indexPath;
      }
    }
  }
  for (const _ext of extensions) {
    const targetPath = `${rawEntryPoint}.${_ext}`;
    if (await pathExists(targetPath, 'file')) {
      return targetPath;
    }
  }
  return rawEntryPoint;
}

export async function pathExists(filepath: string, type?: 'file' | 'dir') {
  try {
    const stat = await fs.stat(filepath);
    if (type === 'file') return stat.isFile();
    if (type === 'dir') return stat.isDirectory();
    return true;
  } catch (err: any) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

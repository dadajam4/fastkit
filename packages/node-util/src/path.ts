import path from 'path';
import fs from 'fs-extra';

export async function resolveEntryPoint(
  rawEntryPoint: string,
  extensions: string | string[] = ['ts', 'js'],
) {
  const { ext, base } = path.parse(rawEntryPoint);
  if (ext) {
    return base;
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

export async function findPackageDir(
  from: string = process.cwd(),
): Promise<string | undefined> {
  let result: string | undefined;

  if (await pathExists(from, 'file')) {
    from = path.dirname(from);
  }

  while (true) {
    const target = path.join(from, 'package.json');
    try {
      const pkg = require(target);
      if (pkg) {
        result = from;
        break;
      }
    } catch (err) {
      if (!err.message.startsWith('Cannot find module')) {
        throw err;
      }
    }
    const next = path.dirname(from);
    if (next === from) {
      break;
    }
    from = next;
  }
  return result;
}

export async function pathExists(filepath: string, type?: 'file' | 'dir') {
  try {
    const stat = await fs.stat(filepath);
    if (type === 'file') return stat.isFile();
    if (type === 'dir') return stat.isDirectory();
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

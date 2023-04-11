import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getFilename(importMetaURL: string) {
  return fileURLToPath(importMetaURL);
}

export function getDirname(importMetaURL: string) {
  return path.dirname(getFilename(importMetaURL));
}

const FILE_NOT_FOUND_EXCEPTION_CODES = ['ENOTDIR', 'ENOENT'] as const;

export function isFileNotFoundException(
  source: unknown,
): source is NodeJS.ErrnoException {
  return (
    !!source &&
    typeof source === 'object' &&
    FILE_NOT_FOUND_EXCEPTION_CODES.includes(
      (source as NodeJS.ErrnoException).code as any,
    )
  );
}

export async function pathExists(
  target: string,
  type?: 'file' | 'dir',
): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(target);
    if (!type) return true;
    return type === 'file' ? stats.isFile() : stats.isDirectory();
  } catch (err) {
    if (isFileNotFoundException(err)) return false;
    throw err;
  }
}

type FileMatcherFn = (
  file: fs.Dirent,
  dir: string,
) => boolean | Promise<boolean>;

type FileMatcher = string | RegExp | FileMatcherFn;

function normalizeFileMatcher(matcher: FileMatcher): FileMatcherFn {
  if (typeof matcher === 'function') {
    return matcher;
  }
  if (typeof matcher === 'string') {
    return (file) => file.name.includes(matcher);
  }
  return (file) => matcher.test(file.name);
}

export async function findFile(
  dir: string,
  matcher: FileMatcher,
  recursive = true,
): Promise<string | undefined> {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const _matcher = normalizeFileMatcher(matcher);

  const dirs: fs.Dirent[] | undefined = recursive ? [] : undefined;

  for (const file of files) {
    if (dirs && file.isDirectory()) {
      dirs.push(file);
      continue;
    }
    if (await _matcher(file, dir)) {
      return path.join(dir, file.name);
    }
  }

  if (dirs) {
    for (const subDir of dirs) {
      const hit = await findFile(
        path.join(dir, subDir.name),
        _matcher,
        recursive,
      );
      if (hit) return hit;
    }
  }
}

export interface FindConfigResult {
  dir: string;
  fileName: string;
  path: string;
  code: string;
}

interface FindConfigSettings<AllowMissing extends boolean | undefined> {
  fileName: string | string[];
  allowMissing?: AllowMissing;
  test?: (result: FindConfigResult) => boolean;
  /**
   * Trace up to how many directories above
   * @default 10
   */
  depth?: number;
}

const FIND_CONFIG_OR_RE = /\(.+?\)/g;

function parseFindConfigFileName(source: string): string[] {
  const matches = source.match(FIND_CONFIG_OR_RE);
  if (!matches) return [source];
  return matches
    .map((matched) => {
      const parts = matched.slice(1, matched.length - 1).split('|');
      return parts
        .map((part) => {
          const chunk = source.replace(matched, part);
          return parseFindConfigFileName(chunk);
        })
        .flat();
    })
    .flat();
}

function parseRawFindConfigFileName(source: string | string[]): string[] {
  return Array.isArray(source)
    ? source.map(parseFindConfigFileName).flat()
    : parseFindConfigFileName(source);
}

export async function findConfig<
  AllowMissing extends boolean | undefined = false,
>(
  fileNameOrSettings: string | string[] | FindConfigSettings<AllowMissing>,
  dir = process.cwd(),
  currentDepth = 0,
): Promise<
  AllowMissing extends true ? FindConfigResult | null : FindConfigResult
> {
  const settings: FindConfigSettings<AllowMissing> =
    typeof fileNameOrSettings === 'object' && !Array.isArray(fileNameOrSettings)
      ? fileNameOrSettings
      : { fileName: fileNameOrSettings };

  const { fileName, test, depth = 10, allowMissing } = settings;
  const fileNames = parseRawFindConfigFileName(fileName);
  if (depth && currentDepth === depth) {
    if (allowMissing) return null as any;
    throw new Error(
      `Failed to retrieve the "${fileName}" file because the maximum depth was reached.`,
    );
  }

  const next = (err?: unknown) => {
    const nextDir = path.dirname(dir);
    if (nextDir !== dir) {
      return findConfig(fileName, nextDir, currentDepth + 1);
    }
    if (allowMissing) return null as any;
    throw err || new Error(`missing config "${fileName}"`);
  };

  const result = await (async () => {
    for (const fileName of fileNames) {
      try {
        const _path = path.join(dir, fileName);
        const code = await fs.promises.readFile(_path, 'utf-8');
        const result: FindConfigResult = {
          fileName,
          dir,
          path: _path,
          code,
        };
        if (!test || test(result)) {
          return result;
        }
      } catch (err) {
        if (!isFileNotFoundException(err)) {
          throw err;
        }
      }
    }
  })();

  if (!result) {
    return next();
  }

  return result;
}

function _rmrf(path: string): Promise<void> {
  return fs.promises
    .rm(path, {
      recursive: true,
      force: true,
    })
    .catch((err) => {
      if (isFileNotFoundException(err)) return;
      throw err;
    });
}

export async function rmrf(...paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => _rmrf(path)));
}

export function copyDirSync(srcDir: string, destDir: string): void {
  if (!fs.existsSync(srcDir)) return;

  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    if (srcFile === destDir) {
      continue;
    }
    const destFile = path.resolve(destDir, file);
    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      copyDirSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

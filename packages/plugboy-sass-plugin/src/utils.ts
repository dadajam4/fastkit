import { parse, resolve } from 'path';
import { existsSync } from 'fs';

export function modulesPaths(absWorkingDir?: string): string[] {
  let path = absWorkingDir || process.cwd();
  const { root } = parse(path);
  const found: string[] = [];

  while (path !== root) {
    const filename = resolve(path, 'node_modules');
    if (existsSync(filename)) {
      found.push(filename);
    }
    path = resolve(path, '..');
  }
  return [...found];
}

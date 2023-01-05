import fs from 'fs-extra';
import path from 'path';
import { render } from 'eta';
import chalk from 'chalk';
import {
  FastkitAppConfig,
  FastkitAppPackageConfig,
  DEFAULT_DEPENDENCIES,
  VUE_DEPENDENCIES,
  DEPENDENCIE_VERSION_MAP,
} from './schemes';
import { fileURLToPath } from 'node:url';

const _dirname = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

const { version: fastkitVersion } = require('../package.json');

export const TEMPLATES_DIR = path.resolve(_dirname, '../templates');

export const PACKAGES_DIR = path.join(TEMPLATES_DIR, 'packages');

export async function getAllPackageConfigs() {
  const configs: FastkitAppPackageConfig[] = [];
  const tmp = (await fs.readdir(PACKAGES_DIR)).map((name) => {
    return {
      name,
      path: path.join(PACKAGES_DIR, name),
    };
  });

  await Promise.all(
    tmp.map(async (dir) => {
      const configPath = path.join(dir.path, 'app.config.json');
      if (await fs.pathExists(configPath)) {
        const json = await fs.readJSON(configPath);
        configs.push({
          name: dir.name,
          src: dir.path,
          ...json,
        });
      }
    }),
  );

  return configs;
}

export function getBaseDependencies(opts: { vue?: boolean } = {}): string[] {
  const dependencies: string[] = [...DEFAULT_DEPENDENCIES];
  if (opts.vue) {
    dependencies.unshift('@fastkit/vue-kit');
    dependencies.push(...VUE_DEPENDENCIES);
  } else {
    dependencies.unshift('fastkit');
  }
  return dependencies;
}

export function toVersionMapedDependencies(dependencies: string[]) {
  const fastkitRe = /^@?fastkit($|\/)/;
  const map: { [pkg: string]: string } = {};
  dependencies.forEach((pkg) => {
    const version = fastkitRe.test(pkg)
      ? fastkitVersion
      : DEPENDENCIE_VERSION_MAP[pkg];
    if (version) {
      map[pkg] = version;
    } else {
      console.warn(`missing dependencie version "${pkg}"`);
    }
  });
  return map;
}

interface FileInfo {
  name: string;
  ext: string;
  dir: string;
  fullPath: string;
  relativePath: string;
}

const GET_FILE_IGNORE = ['.DS_Store', 'app.config.json'];

export async function getFlatFiles(
  _dir: string,
  root?: string,
): Promise<FileInfo[]> {
  if (!root) {
    root = _dir;
  }
  const results: FileInfo[] = [];
  const files = await fs.readdir(_dir);
  for (const file of files) {
    if (GET_FILE_IGNORE.includes(file)) {
      continue;
    }
    const fullPath = path.join(_dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      const children = await getFlatFiles(fullPath, root);
      results.push(...children);
    } else {
      const { ext, dir } = path.parse(fullPath);
      const info: FileInfo = {
        name: file,
        fullPath,
        dir,
        ext,
        relativePath: fullPath.replace(root, ''),
      };
      results.push(info);
    }
  }
  return results;
}

export async function processTemplate(
  fileInfo: FileInfo,
  workspace: FastkitAppConfig,
  pkg?: FastkitAppPackageConfig,
) {
  const { name, fullPath, ext, relativePath } = fileInfo;
  const isTemplate = ext === '.tmpl';
  let outFileName = name.replace('[workspace]', workspace.name);
  if (isTemplate) {
    outFileName = outFileName.replace(/\.tmpl$/, '');
  }
  const _dir = pkg ? pkg.dest : workspace.dest;
  const dest = path.join(_dir, relativePath.replace(name, outFileName));
  const destDir = path.parse(dest).dir;
  await fs.ensureDir(destDir);

  if (isTemplate) {
    let code = await fs.readFile(fullPath, 'utf-8');
    try {
      const compiled = await render(
        code,
        {
          workspace,
          packageList: workspace.packageList,
          packages: workspace.packages,
          package: pkg,
        },
        { async: true },
      );
      code = compiled || '';
      await fs.writeFile(dest, code, 'utf-8');
    } catch (_err) {
      console.log(chalk.red(`Template compile failed. >>> ${fullPath}`));
      throw _err;
    }
  } else {
    await fs.copy(fullPath, dest);
  }
}

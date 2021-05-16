import { ColorScopeOptionalKey, ColorScheme } from '../color-scheme';
import { toScssValues } from './to-scss-values';
import fs from 'fs-extra';
import path from 'path';
import { render } from 'eta';
import { esbuildRequire } from '../../../node-util/src';

const TEMPLATES_DIR = path.resolve(__dirname, 'assets/templates');

export const COLOR_SCHEME_LOADER_TYPES = ['info', 'json', 'scss'] as const;

export type ColorSchemeLoaderType = typeof COLOR_SCHEME_LOADER_TYPES[number];

export interface TemplateScope {
  scheme: ColorScheme<any, any, any, any>;
  scssValues: string;
  list: (source: string[], divider?: string) => string;
}

export type ColorSchemeLoaderResult = {
  entryPoint: string;
  dependencies: string[];
  // scheme: ColorScheme<any, any, any, any>;
  // json: ColorSchemeJSON<any, any, any, any>;
  // info: ColorSchemeInfo<any, any, any>;
  // scss: string;
  cachePaths: {
    scheme: string;
    json: string;
    info: string;
    scss: string;
  };
};

export async function loadColorScheme(
  rawEntryPoint: string,
  dest: string,
): Promise<ColorSchemeLoaderResult> {
  const {
    entryPoint,
    exports: exportsResult,
    dependencies,
  } = await esbuildRequire(rawEntryPoint);
  const { name: entryName } = path.parse(entryPoint);
  // const cachePathPrefix = entryDir.replace(/\//g, '_') + '_';
  const scheme = exportsResult.default as ColorScheme<any, any, any, any>;
  const json = scheme.toJSON();
  const scssValues = toScssValues(scheme);
  // const cacheDir = await ensureCacheDir();
  const templateScope: TemplateScope = {
    scheme,
    scssValues,
    list: (source, divider = ', ') => {
      return source.map((sourc) => `'${sourc}'`).join(divider);
    },
  };

  await fs.ensureDir(dest);

  async function generateScssCache() {
    const fileName = entryName + '.scss';
    const cachePath = path.join(dest, fileName);
    const content = await renderTemplate('scss', templateScope);
    await fs.writeFile(cachePath, content);
    return {
      content,
      cachePath,
    };
  }

  async function generateInfoCache() {
    const fileName = entryName + '.info.ts';
    const cachePath = path.join(dest, fileName);
    const content = await renderTemplate('info', templateScope);
    await fs.writeFile(cachePath, content);
    return {
      content,
      cachePath,
    };
  }

  async function generateJSONCache() {
    const fileName = entryName + '.json';
    const cachePath = path.join(dest, fileName);
    const content = `export default ${JSON.stringify(json)};`;
    return {
      content,
      cachePath,
    };
  }

  async function generateSchemeCache() {
    const fileName = entryName + '.ts';
    const cachePath = path.join(dest, fileName);
    const content = await fs.readFile(entryPoint, 'utf-8');
    await fs.writeFile(cachePath, content);
    return {
      content,
      cachePath,
    };
  }

  const [scssResult, infoResult, jsonResult, schemeResult] = await Promise.all([
    generateScssCache(),
    generateInfoCache(),
    generateJSONCache(),
    generateSchemeCache(),
  ]);

  return {
    entryPoint,
    dependencies,
    cachePaths: {
      scheme: schemeResult.cachePath,
      json: jsonResult.cachePath,
      info: infoResult.cachePath,
      scss: scssResult.cachePath,
    },
  };
}

type TemplateName = 'info' | 'scss';

async function getTemplate(name: TemplateName) {
  const filePath = path.join(TEMPLATES_DIR, `${name}.tmpl`);
  return fs.readFile(filePath, 'utf-8');
}

async function renderTemplate<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(name: TemplateName, scope: TemplateScope) {
  const tmpl = await getTemplate(name);
  const result = await render(tmpl, scope);
  return result || '';
}

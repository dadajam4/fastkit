import {
  ColorScheme,
  TemplateScope,
  BULTIN_COLOR_VARIANTS,
  BultinColorVariant,
} from '@fastkit/color-scheme';
import { toScssValues } from './to-scss-values';
import fs from 'fs-extra';
import path from 'node:path';
import { render } from 'eta';
import { ESbuildRunner, ESbuildRequireResult } from '@fastkit/node-util';
import { EV } from '@fastkit/ev';
import { logger, ColorSchemeGenError } from './logger';

const TEMPLATES_DIR = __plugboyPublicDir('templates');

export const COLOR_SCHEME_LOADER_TYPES = ['info', 'json', 'scss'] as const;

export type ColorSchemeLoaderType = (typeof COLOR_SCHEME_LOADER_TYPES)[number];

export type ColorSchemeLoaderResult = {
  entryPoint: string;
  dependencies: string[];
  cachePaths: {
    scheme: string;
    json: string;
    info: string;
    scss: string;
  };
};

export interface LoadColorSchemeRunnerOptions {
  entry: string;
  dest: string;
  watch?: boolean;
}

export interface LoadColorSchemeRunnerLoadResult {
  cachePaths: {
    json: string;
    info: string;
    scss: string;
  };
}

export interface LoadColorSchemeRunnerEventMap {
  load: ESbuildRequireResult<LoadColorSchemeRunnerLoadResult>;
}

export class LoadColorSchemeRunner extends EV<LoadColorSchemeRunnerEventMap> {
  private runner: ESbuildRunner<LoadColorSchemeRunnerLoadResult>;
  readonly dest: string;

  constructor(opts: LoadColorSchemeRunnerOptions) {
    super();

    this.resolver = this.resolver.bind(this);
    this.dest = opts.dest;

    this.runner = new ESbuildRunner({
      entry: opts.entry,
      watch: opts.watch,
      resolver: this.resolver,
    });
    this.runner.on('build', (result) => {
      this.emit('load', result);
    });
  }

  async resolver(
    result: ESbuildRequireResult<{
      default: ColorScheme<any, any, any, any>;
    }>,
  ): Promise<LoadColorSchemeRunnerLoadResult> {
    const { entryPoint, exports } = result;
    const { name: entryName } = path.parse(entryPoint);
    const scheme = exports.default;
    const { dest } = this;
    const json = scheme.toJSON();
    const scssValues = toScssValues(scheme);
    const templateScope: TemplateScope = {
      scheme,
      scssValues,
      list(source, divider = ', ') {
        return source.map((sourc) => `'${sourc}'`).join(divider);
      },
      async builtinVariantScss(variant, selector) {
        const tmpl = await getVariantTemplate(variant);
        if (!selector) {
          selector = variant;
        }
        const result = await render(tmpl, { selector }, { async: true });
        return result || '';
      },
      async variantScss(variant) {
        const variantSource = scheme.variantSources.find(
          ({ name }) => name === variant,
        );
        if (!variantSource) {
          logger.warn(`missing variant source "${variant}"`);
          return '';
        }

        const { from, scss } = variantSource;
        if (typeof scss === 'function') {
          return scss(templateScope);
        }
        if (scss) return scss;

        if (from && !BULTIN_COLOR_VARIANTS.includes(from)) {
          throw new ColorSchemeGenError(`missing builtin variant "${from}"`);
        }
        const _from = from || variant;
        if (BULTIN_COLOR_VARIANTS.includes(_from as any)) {
          return templateScope.builtinVariantScss(_from as any, variant);
        }
        return '';
      },
      async allVariantsScss() {
        const results = await Promise.all(
          scheme.variants.map((variant) => templateScope.variantScss(variant)),
        );
        return results.join('\n');
      },
    };

    await fs.ensureDir(this.dest);

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

    const [scssResult, infoResult, jsonResult] = await Promise.all([
      generateScssCache(),
      generateInfoCache(),
      generateJSONCache(),
    ]);

    const _result: LoadColorSchemeRunnerLoadResult = {
      cachePaths: {
        json: jsonResult.cachePath,
        info: infoResult.cachePath,
        scss: scssResult.cachePath,
      },
    };
    return _result;
  }

  run() {
    return this.runner.run();
  }
}

type TemplateName = 'info' | 'scss';

async function getTemplate(name: TemplateName) {
  const filePath = path.join(TEMPLATES_DIR, `${name}.tmpl`);
  return fs.readFile(filePath, 'utf-8');
}

async function getVariantTemplate(name: BultinColorVariant) {
  const filePath = path.join(TEMPLATES_DIR, `variant.${name}.tmpl`);
  return fs.readFile(filePath, 'utf-8');
}

async function renderTemplate(name: TemplateName, scope: TemplateScope) {
  const tmpl = await getTemplate(name);
  const result = await render(tmpl, scope, { async: true });
  return result || '';
}

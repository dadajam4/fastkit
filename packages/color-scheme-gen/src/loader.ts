import {
  ColorScheme,
  TemplateScope,
  BUILTIN_COLOR_VARIANTS,
  BuiltinColorVariant,
} from '@fastkit/color-scheme';
import fs from 'fs-extra';
import path from 'node:path';
import { Eta } from 'eta';
import { ESbuildRunner, ESbuildRequireResult } from '@fastkit/node-util';
import { EV } from '@fastkit/ev';
import { toScssValues } from './to-scss-values';
import { logger, ColorSchemeGenError } from './logger';
import { getPackageDir } from '@fastkit/plugboy/runtime-utils';

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

/**
 * Module the generated color-scheme info imports its types from, and augments
 * with the scheme's theme / palette / scope / variant names.
 *
 * @see {@link LoadColorSchemeRunnerOptions.runtimeModule}
 */
export const DEFAULT_COLOR_SCHEME_RUNTIME_MODULE = '@fastkit/color-scheme';

export interface LoadColorSchemeRunnerOptions {
  entry: string;
  dest: string;
  watch?: boolean;
  /**
   * Module the generated info file imports `ColorSchemeInfo` from, and whose
   * `ThemeSettings` / `PaletteSettings` / `ScopeSettings` /
   * `ColorVariantSettings` it augments with the scheme's real names.
   *
   * The generated files live in the *consuming* project, so this specifier is
   * resolved from there -- and pnpm places into a project's `node_modules` only
   * what the project itself declares, not what a peer declaration asks for. So
   * whatever this names becomes a package the project has to declare.
   *
   * Point it at a module the project already declares and that re-exports the
   * four `*Settings` interfaces and `ColorSchemeInfo` -- a UI kit built on
   * `@fastkit/color-scheme`, say -- and the project needs nothing beyond that
   * kit. Module augmentation follows a re-export to the interface it aliases,
   * so the settings still merge into the ones `@fastkit/color-scheme` declares,
   * and `ThemeName` and friends agree everywhere.
   *
   * @default '@fastkit/color-scheme'
   */
  runtimeModule?: string;
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

  /** @see {@link LoadColorSchemeRunnerOptions.runtimeModule} */
  readonly runtimeModule: string;

  constructor(opts: LoadColorSchemeRunnerOptions) {
    super();

    this.resolver = this.resolver.bind(this);
    this.dest = opts.dest;
    this.runtimeModule =
      opts.runtimeModule ?? DEFAULT_COLOR_SCHEME_RUNTIME_MODULE;

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
    const { dest, runtimeModule } = this;
    const json = scheme.toJSON();
    const scssValues = toScssValues(scheme);
    const templateScope: TemplateScope = {
      scheme,
      scssValues,
      list(source, divider = ', ') {
        return source.map((_source) => `'${_source}'`).join(divider);
      },
      async builtinVariantScss(variant, selector) {
        const tmpl = await getVariantTemplate(variant);
        if (!selector) {
          selector = variant;
        }
        const eta = new Eta();
        const _result = await eta.renderStringAsync(tmpl, { selector });
        return _result || '';
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

        if (from && !BUILTIN_COLOR_VARIANTS.includes(from)) {
          throw new ColorSchemeGenError(`missing builtin variant "${from}"`);
        }
        const _from = from || variant;
        if (BUILTIN_COLOR_VARIANTS.includes(_from as any)) {
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
      const fileName = `${entryName}.scss`;
      const cachePath = path.join(dest, fileName);
      const content = await renderTemplate('scss', templateScope);
      await fs.writeFile(cachePath, content);
      return {
        content,
        cachePath,
      };
    }

    async function generateInfoCache() {
      const fileName = `${entryName}.info.ts`;
      const cachePath = path.join(dest, fileName);
      const content = await renderTemplate('info', templateScope, {
        runtimeModule,
      });
      await fs.writeFile(cachePath, content);
      return {
        content,
        cachePath,
      };
    }

    async function generateJSONCache() {
      const fileName = `${entryName}.json`;
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

async function getTemplateDir() {
  const packageDir = await getPackageDir();
  return path.join(packageDir, 'dist', 'templates');
}

async function getTemplate(name: TemplateName) {
  const filePath = path.join(await getTemplateDir(), `${name}.tmpl`);
  return fs.readFile(filePath, 'utf-8');
}

async function getVariantTemplate(name: BuiltinColorVariant) {
  const filePath = path.join(await getTemplateDir(), `variant.${name}.tmpl`);
  return fs.readFile(filePath, 'utf-8');
}

/**
 * `data` is merged over the scope so a template can read values that are not
 * part of `TemplateScope` -- that interface belongs to `@fastkit/color-scheme`
 * and describes the SCSS rendering helpers, not this package's options.
 */
async function renderTemplate(
  name: TemplateName,
  scope: TemplateScope,
  data?: Record<string, unknown>,
) {
  const tmpl = await getTemplate(name);
  const eta = new Eta();
  const result = await eta.renderStringAsync(tmpl, { ...scope, ...data });
  return result || '';
}

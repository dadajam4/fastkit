import { Plugin } from 'vite';
import { resolve } from 'node:path';
import { resolveAdditionalData } from '~/utils';

export interface SassAdditional {
  src: string;
  alias?: string;
}

export type RawSassAdditional = string | SassAdditional;

export interface StyleAdditionalVitePluginOptions {
  sass?: RawSassAdditional[];
  scss?: RawSassAdditional[];
}

export function styleAdditionalVitePlugin(
  opts: StyleAdditionalVitePluginOptions,
): Plugin {
  return {
    name: 'vite:style-additional-data',
    async config(config) {
      const cssOptions = {
        ...config.css,
      };
      cssOptions.preprocessorOptions = {
        ...cssOptions.preprocessorOptions,
      };
      const { preprocessorOptions } = cssOptions;

      (['sass', 'scss'] as const).forEach((type) => {
        const settings = opts[type];
        if (!settings || !settings.length) return;

        const uses = settings
          .map((raw) => {
            const additional: SassAdditional =
              typeof raw === 'string' ? { src: raw } : raw;
            const { src, alias } = additional;
            const suffix = alias ? ` as ${alias}` : '';
            return `@use '${resolve(src)}'${suffix};`;
          })
          .join('\n');

        let options = preprocessorOptions[type];
        if (!options) {
          options = {};
          preprocessorOptions[type] = options;
        }
        const _additionalData = options.additionalData;
        const additionalData = async (source: string, filename: string) => {
          source = await resolveAdditionalData(
            source,
            filename,
            _additionalData,
          );
          return `${uses}\n${source}`;
        };
        options.additionalData = additionalData;
      });

      config.css = cssOptions;
      return config;
    },
  };
}

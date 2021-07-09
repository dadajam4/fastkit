import { Plugin } from 'vite';
import { resolve } from 'path';

export interface StyleAdditionalVitePluginOptions {
  sass?: string[];
  scss?: string[];
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

        const imports = settings
          .map((style) => `@import '${resolve(style)}';`)
          .join('\n');

        let options = preprocessorOptions[type];
        if (!options) {
          options = {};
          preprocessorOptions[type] = options;
        }
        const _additionalData = options.additionalData;
        const additionalData = (source: string, filename: string) => {
          if (typeof _additionalData === 'string') {
            source = _additionalData + source;
          } else if (typeof _additionalData === 'function') {
            source = _additionalData(source, filename);
          }
          return `${imports}\n${source}`;
        };
        options.additionalData = additionalData;
      });

      config.css = cssOptions;
      return config;
    },
  };
}

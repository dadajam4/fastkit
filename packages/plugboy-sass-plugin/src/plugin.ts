import { definePlugin } from '@fastkit/plugboy';
import sass from 'rollup-plugin-sass';
import { PLUGIN_NAME, PluginOptions, SassPlugin } from './types';
import { modulesPaths } from './utils';

export function createSassPlugin(options: PluginOptions = {}) {
  let _styles = '';

  const { sass: sassOptions, ...restOptions } = options;

  const {
    name: _name,
    generateBundle,
    ...sassPluginSettings
  } = sass({
    api: 'modern',
    ...restOptions,
    options: {
      ...sassOptions,
      loadPaths: Array.from(
        new Set([...(sassOptions?.loadPaths || modulesPaths())]),
      ),
    },
    output(styles) {
      _styles = styles;
    },
  });

  return definePlugin<SassPlugin>({
    name: PLUGIN_NAME,
    _options: options,
    ...(sassPluginSettings as any),
    async generateBundle(outputOptions, bundle, isWrite) {
      if (typeof generateBundle === 'function') {
        await generateBundle.call(
          this as any,
          outputOptions as any,
          bundle as any,
          isWrite,
        );
      }

      if (!_styles) return;

      let cssFile = outputOptions.file;
      if (!cssFile) {
        const fileNames = Object.keys(bundle);
        const jsFile = fileNames.find((f) => /\.m?js$/.test(f));
        if (!jsFile) {
          return;
        }
        cssFile = jsFile.replace(/\.m?js$/, '.css');
      }
      this.emitFile({
        type: 'asset',
        name: cssFile,
        fileName: cssFile,
        source: _styles,
      });
    },
  });
}

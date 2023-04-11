import { ESBuildPlugin } from '@fastkit/plugboy';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import { PluginOptions } from './types';
import { mergeExternal } from './utils';

export function ESBuildVanillaExtract(
  options: PluginOptions = {},
): ESBuildPlugin {
  const { esbuildOptions = {} } = options;

  return vanillaExtractPlugin({
    ...options,
    esbuildOptions: {
      ...esbuildOptions,
      external: mergeExternal(esbuildOptions.external),
    },
  }) as any;
}

import { PLUGIN_NAME, VanillaExtractPlugin } from './types';
import { findProjectPlugin } from '@fastkit/plugboy';
import { Plugin as VitePlugin } from 'vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { mergeExternal } from './utils';

type VanillaExtractVitePluginOptions = NonNullable<
  Parameters<typeof vanillaExtractPlugin>[0]
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViteVanillaExtractPluginOptions
  extends VanillaExtractVitePluginOptions {}

export async function ViteVanillaExtractPlugin(
  options: ViteVanillaExtractPluginOptions = {},
): Promise<VitePlugin> {
  const plugin = await findProjectPlugin<VanillaExtractPlugin>(PLUGIN_NAME);
  const {
    identifiers: baseIdentifiers,
    esbuildOptions: baseEsbuildOptions = {},
  } = plugin?.options || {};

  const { esbuildOptions = {} } = options;

  return vanillaExtractPlugin({
    identifiers: baseIdentifiers,
    ...options,
    esbuildOptions: {
      ...baseEsbuildOptions,
      ...esbuildOptions,
      external: mergeExternal(
        baseEsbuildOptions.external,
        esbuildOptions.external,
      ),
    },
  });
}

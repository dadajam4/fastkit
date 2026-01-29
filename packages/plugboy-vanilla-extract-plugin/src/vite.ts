import { findProjectPlugin } from '@fastkit/plugboy';
import { Plugin as VitePlugin } from 'vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { PLUGIN_NAME, VanillaExtractPlugin } from './types';

type VanillaExtractVitePluginOptions = NonNullable<
  Parameters<typeof vanillaExtractPlugin>[0]
>;

export interface ViteVanillaExtractPluginOptions
  extends VanillaExtractVitePluginOptions {}

export async function ViteVanillaExtractPlugin(
  options: ViteVanillaExtractPluginOptions = {},
): Promise<VitePlugin[]> {
  const plugin = await findProjectPlugin<VanillaExtractPlugin>(PLUGIN_NAME);
  const { identifiers: baseIdentifiers } = plugin?._options || {};

  return vanillaExtractPlugin({
    identifiers: baseIdentifiers,
    ...options,
  });
}

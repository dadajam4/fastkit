import { Plugin } from '@fastkit/plugboy';
import type { vanillaExtractPlugin as esbuildPlugin } from '@vanilla-extract/esbuild-plugin';

type VanillaExtractPluginOptions = NonNullable<
  Parameters<typeof esbuildPlugin>[0]
>;

export interface VanillaExtractEsbuildOptions
  extends NonNullable<VanillaExtractPluginOptions['esbuildOptions']> {}

export interface PluginOptions
  extends Pick<VanillaExtractPluginOptions, 'identifiers' | 'esbuildOptions'> {}

export const PLUGIN_NAME = 'plugboy-vanilla-extract';

export interface VanillaExtractPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  options: PluginOptions;
}

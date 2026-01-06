import { Plugin } from '@fastkit/plugboy';
import type { vanillaExtractPlugin as rollupPlugin } from '@vanilla-extract/rollup-plugin';

type VanillaExtractPluginOptions = NonNullable<
  Parameters<typeof rollupPlugin>[0]
>;

export interface PluginOptions
  extends Pick<VanillaExtractPluginOptions, 'identifiers' | 'esbuildOptions'> {}

export const PLUGIN_NAME = 'plugboy-vanilla-extract';

export interface VanillaExtractPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  _options: PluginOptions;
}

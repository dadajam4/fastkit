import { Plugin } from '@fastkit/plugboy';
import sass from 'rollup-plugin-sass';
import { type Options as SassOptions } from 'sass';

type RollupPluginSassOptions = NonNullable<Parameters<typeof sass>[0]>;

export interface PluginOptions
  extends Pick<RollupPluginSassOptions, 'include' | 'exclude'> {
  sass?: SassOptions<'async'>;
}

export const PLUGIN_NAME = 'plugboy-sass';

export interface SassPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  _options: PluginOptions;
}

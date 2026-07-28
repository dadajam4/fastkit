import { Plugin } from '@fastkit/plugboy';
import sass from 'rollup-plugin-sass';
import { type Options as SassOptions } from 'sass';

type RollupPluginSassOptions = NonNullable<Parameters<typeof sass>[0]>;

export interface PluginOptions extends Pick<
  RollupPluginSassOptions,
  'include' | 'exclude'
> {
  sass?: SassOptions<'async'>;
}

/**
 * One stylesheet as collected by rollup-plugin-sass, handed to the `output`
 * callback alongside the concatenated result.
 */
export type SassStyleEntry = Parameters<
  Extract<NonNullable<RollupPluginSassOptions['output']>, (...args: any) => any>
>[1][number];

export const PLUGIN_NAME = 'plugboy-sass';

export interface SassPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  _options: PluginOptions;
}

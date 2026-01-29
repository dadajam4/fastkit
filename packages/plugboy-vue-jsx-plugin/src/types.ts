import { Plugin } from '@fastkit/plugboy';
import type VueJsx from 'unplugin-vue-jsx/rolldown';

export type _Options = NonNullable<Parameters<typeof VueJsx>[0]>;

export interface PluginOptions extends _Options {
  // sourceMaps?: boolean;
  // jsx?: JSXOptions;
}

export const PLUGIN_NAME = 'plugboy-vue-jsx';

export interface VueJSXPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  _options: PluginOptions;
}

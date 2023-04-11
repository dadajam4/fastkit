import { Plugin } from '@fastkit/plugboy';
import { VueJSXPluginOptions } from '@vue/babel-plugin-jsx';

export interface JSXOptions extends VueJSXPluginOptions {
  sourceMaps?: boolean;
}

export interface PluginOptions {
  sourceMaps?: boolean;
  jsx?: JSXOptions;
}

export const PLUGIN_NAME = 'plugboy-vue-jsx';

export interface VueJSXPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  options: PluginOptions;
}

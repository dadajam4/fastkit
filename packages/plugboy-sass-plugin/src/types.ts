import { Plugin } from '@fastkit/plugboy';

export interface PluginOptions {}

export const PLUGIN_NAME = 'plugboy-sass';

export interface SassPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
}

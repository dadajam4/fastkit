import { Plugin } from '@fastkit/plugboy';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export const PLUGIN_NAME = 'plugboy-sass';

export interface SassPlugin extends Plugin {
  name: typeof PLUGIN_NAME;
}

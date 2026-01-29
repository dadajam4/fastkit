import { Plugin } from '@fastkit/plugboy';
import type VuePlugin from 'unplugin-vue/rolldown';

export type _Options = NonNullable<Parameters<typeof VuePlugin>[0]>;

export interface PluginOptions extends _Options {}

export const PLUGIN_NAME = 'plugboy-vue';

export interface VuePlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  _options: PluginOptions;
}

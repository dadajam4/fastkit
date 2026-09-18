import { Plugin } from '@fastkit/plugboy';
// Named apart from the `VuePlugin` interface below: two bindings of the same
// name in one module left the emitted declaration referring to the interface
// as a value (issue #239).
import type unpluginVue from 'unplugin-vue/rolldown';

export type _Options = NonNullable<Parameters<typeof unpluginVue>[0]>;

export interface PluginOptions extends _Options {}

export const PLUGIN_NAME = 'plugboy-vue';

export interface VuePlugin extends Plugin {
  name: typeof PLUGIN_NAME;
  _options: PluginOptions;
}

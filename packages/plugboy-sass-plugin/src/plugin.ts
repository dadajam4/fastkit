import { definePlugin, ESBuildPlugin } from '@fastkit/plugboy';
import { PLUGIN_NAME, PluginOptions, SassPlugin } from './types';
import { sassPlugin } from 'esbuild-sass-plugin';

export function createSassPlugin(options?: PluginOptions) {
  return definePlugin<SassPlugin>({
    name: PLUGIN_NAME,
    esbuildPlugins: [sassPlugin(options) as unknown as ESBuildPlugin],
  });
}

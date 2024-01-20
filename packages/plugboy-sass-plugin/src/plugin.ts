import { definePlugin, ESBuildPlugin } from '@fastkit/plugboy';
import { sassPlugin } from 'esbuild-sass-plugin';
import { PLUGIN_NAME, PluginOptions, SassPlugin } from './types';

export function createSassPlugin(options?: PluginOptions) {
  return definePlugin<SassPlugin>({
    name: PLUGIN_NAME,
    esbuildPlugins: [sassPlugin(options) as unknown as ESBuildPlugin],
  });
}

import { definePlugin } from '@fastkit/plugboy';
import { PluginOptions, VueJSXPlugin, PLUGIN_NAME } from './types';
import VueJsx from 'unplugin-vue-jsx/rolldown';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVue: boolean;
  }
}

export function createVueJSXPlugin(options: PluginOptions = {}) {
  return definePlugin<VueJSXPlugin>({
    name: PLUGIN_NAME,
    _options: options,
    hooks: {
      setupWorkspace(ctx) {
        ctx.meta.hasVue = ctx.dependencies.includes('vue');
        ctx.plugins.push(VueJsx(options));
        // if (ctx.meta.hasVue) {
        //   ctx.config.plugins.push(VueJsx(options));
        // }
      },
    },
    // esbuildPlugins: [
    //   (workspace) => {
    //     if (!workspace.meta.hasVue) return;
    //     return ESBuildVueJSX(options.jsx);
    //   },
    // ],
  });
}

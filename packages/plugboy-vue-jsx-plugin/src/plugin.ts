import { definePlugin } from '@fastkit/plugboy';
import { ESBuildVueJSX } from './esbuild';
import { PluginOptions, VueJSXPlugin, PLUGIN_NAME } from './types';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVue: boolean;
  }
}

export function createVueJSXPlugin(options: PluginOptions = {}) {
  return definePlugin<VueJSXPlugin>({
    name: PLUGIN_NAME,
    options,
    hooks: {
      setupWorkspace(ctx) {
        ctx.meta.hasVue = ctx.dependencies.includes('vue');
      },
    },
    esbuildPlugins: [
      (workspace) => {
        if (!workspace.meta.hasVue) return;
        return ESBuildVueJSX(options.jsx);
      },
    ],
  });
}

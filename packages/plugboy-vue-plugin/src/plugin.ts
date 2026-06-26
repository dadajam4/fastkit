import { definePlugin, type DTSCompilerOption } from '@fastkit/plugboy';
import { PluginOptions, VuePlugin, PLUGIN_NAME } from './types';
import Vue from 'unplugin-vue/rolldown';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVue: boolean;
  }
}

const applyCompiler = (config: { compiler?: DTSCompilerOption }) => {
  if (config.compiler === 'tsc') {
    config.compiler = 'vue-tsc';
  }
};

export function createVuePlugin(options: PluginOptions = {}) {
  return definePlugin<VuePlugin>({
    name: PLUGIN_NAME,
    _options: options,
    hooks: {
      setupWorkspace(ctx) {
        ctx.meta.hasVue = ctx.dependencies.includes('vue');
        if (ctx.meta.hasVue) {
          ctx.config.dts ??= {};
          applyCompiler(ctx.config.dts);
          applyCompiler(ctx.dts);
          ctx.plugins.push(Vue(options) as any);
        }
      },
    },
  });
}

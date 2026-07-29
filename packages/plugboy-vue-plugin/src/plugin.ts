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
          // `isProduction` defaults to false in unplugin-vue, which turns on the
          // devtools annotations — including `__file`, carrying the **absolute**
          // path of the SFC into the published bundle. plugboy builds artifacts
          // for publishing, so production is the right default here.
          //
          // Production mode also switches on template inlining, which rewrites a
          // `<script setup>` component's compiled shape (the render function moves
          // into `setup`). That is a codegen change rather than a leak fix, so it
          // stays off; a consumer can opt into either by passing the option.
          ctx.plugins.push(
            Vue({
              isProduction: true,
              inlineTemplate: false,
              ...options,
            }) as any,
          );
        }
      },
    },
  });
}

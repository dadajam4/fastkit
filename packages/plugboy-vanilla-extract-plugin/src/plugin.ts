import { definePlugin, findFile } from '@fastkit/plugboy';
import { vanillaExtractPlugin } from './_origin';
import { VanillaExtractPlugin, PluginOptions, PLUGIN_NAME } from './types';
import path from 'node:path';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVanillaExtract: boolean;
  }
}

export async function createVanillaExtractPlugin(options: PluginOptions = {}) {
  return definePlugin<VanillaExtractPlugin>({
    name: PLUGIN_NAME,
    _options: options,
    hooks: {
      async setupWorkspace(ctx, getWorkspace) {
        ctx.mergeExternals(/@vanilla-extract/);

        ctx.meta.hasVanillaExtract = !!(await findFile(
          ctx.dirs.src.value,
          /\.css\.ts$/,
        ));

        if (ctx.meta.hasVanillaExtract) {
          const originalPlugin = vanillaExtractPlugin(
            {
              ...options,
              extract: true,
            },
            () => {
              const exportItems = getWorkspace()?.exports;
              if (!exportItems) return;

              return exportItems
                .filter((item) => item.id.endsWith('.css'))
                .map((item) => path.parse(item.id).name);
            },
          );

          ctx.plugins.push(originalPlugin);
        }
      },
    },
  });
}

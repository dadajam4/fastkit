import { definePlugin, findFile } from '@fastkit/plugboy';
import { vanillaExtractPlugin } from './_origin';
import { VanillaExtractPlugin, PluginOptions, PLUGIN_NAME } from './types';

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
      async setupWorkspace(ctx) {
        ctx.mergeExternals(/@vanilla-extract/);

        ctx.meta.hasVanillaExtract = !!(await findFile(
          ctx.dirs.src.value,
          /\.css\.ts$/,
        ));

        if (ctx.meta.hasVanillaExtract) {
          const originalPlugin = vanillaExtractPlugin({
            ...options,
            extract: true,
          });

          // @TODO
          // rolldown-plugin-dts cannot handle vanilla-extract correctly
          // https://github.com/sxzz/rolldown-plugin-dts/issues/136
          ctx.config.dts ??= {};
          ctx.config.dts.inline = true;
          ctx.dts.inline = true;

          ctx.plugins.push(originalPlugin);
        }
      },
    },
  });
}

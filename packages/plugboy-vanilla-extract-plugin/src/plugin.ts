import { definePlugin, findFile } from '@fastkit/plugboy';
// import fs from 'node:fs/promises';
// @vanilla-extract/rollup-plugin
// import { ESBuildVanillaExtract } from './esbuild';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import { VanillaExtractPlugin, PluginOptions, PLUGIN_NAME } from './types';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVanillaExtract: boolean;
  }
}

const extMatchRe = /\.(mjs|css)$/;

function extractExt(filePath: string) {
  return filePath.match(extMatchRe)?.[1] as 'mjs' | 'css' | undefined;
}

const emptyVanillaImportRe = /(^|\n)import '@vanilla-extract\/css';?/g;

function cleanJS(code: string) {
  return code.replace(emptyVanillaImportRe, '');
}

export async function createVanillaExtractPlugin(options: PluginOptions = {}) {
  const plug = vanillaExtractPlugin({
    ...options,
    extract: {
      // name: '[name].css',
      sourcemap: true,
    },
  });
  return plug;
  // return definePlugin<VanillaExtractPlugin>({
  //   name: PLUGIN_NAME,
  //   _options: options,
  //   // generateBundle(_, bundle) {},
  //   hooks: {
  //     async setupWorkspace(ctx) {
  //       // const { external = [] } = ctx.config;

  //       ctx.mergeExternals(/@vanilla-extract/);
  //       // ctx.config.external = [...external, /@vanilla-extract/];

  //       ctx.meta.hasVanillaExtract = await !!findFile(
  //         ctx.dirs.src.value,
  //         /\.css\.ts$/,
  //       );

  //       const p = vanillaExtractPlugin(options);
  //       console.log(p);
  //       ctx.plugins.push(p as any);
  //     },

  //     // async onSuccess(builder, files) {
  //     //   if (!builder.workspace.meta.hasVanillaExtract) return;
  //     //   await Promise.all(
  //     //     files.map(async ({ path: filePath }) => {
  //     //       const ext = extractExt(filePath);
  //     //       if (!ext) return;

  //     //       const code = await fs.readFile(filePath, 'utf-8');
  //     //       const cleaner = ext === 'mjs' ? cleanJS : undefined;
  //     //       if (!cleaner) return;
  //     //       const replaced = cleaner(code);
  //     //       if (code === replaced) return;

  //     //       await fs.writeFile(filePath, replaced.trimStart(), 'utf-8');
  //     //     }),
  //     //   );
  //     // },
  //   },
  //   // esbuildPlugins: [
  //   //   (workspace) => {
  //   //     if (!workspace.meta.hasVanillaExtract) return;
  //   //     return ESBuildVanillaExtract(options);
  //   //   },
  //   // ],
  // });
}

import { definePlugin, findFile } from '@fastkit/plugboy';
import { ESBuildVanillaExtract } from './esbuild';
import { VanillaExtractPlugin, PluginOptions, PLUGIN_NAME } from './types';
import fs from 'node:fs/promises';

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
  return definePlugin<VanillaExtractPlugin>({
    name: PLUGIN_NAME,
    options,
    hooks: {
      async setupWorkspace(ctx) {
        const { external = [] } = ctx.config;

        ctx.config.external = [...external, /@vanilla\-extract/];

        ctx.meta.hasVanillaExtract = await !!findFile(
          ctx.dirs.src.value,
          /\.css\.ts$/,
        );
      },
      async onSuccess(builder, files) {
        if (!builder.workspace.meta.hasVanillaExtract) return;
        await Promise.all(
          files.map(async ({ path: filePath }) => {
            const ext = extractExt(filePath);
            if (!ext) return;

            const code = await fs.readFile(filePath, 'utf-8');
            const cleaner = ext === 'mjs' ? cleanJS : undefined;
            if (!cleaner) return;
            const replaced = cleaner(code);
            if (code === replaced) return;

            await fs.writeFile(filePath, replaced.trimStart(), 'utf-8');
          }),
        );
      },
    },
    esbuildPlugins: [
      (workspace) => {
        if (!workspace.meta.hasVanillaExtract) return;
        return ESBuildVanillaExtract(options);
      },
    ],
  });
}

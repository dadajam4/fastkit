import {
  build as viteBuild,
  InlineConfig,
  ResolvedConfig,
  mergeConfig,
} from 'vite';
import replace from '@rollup/plugin-replace';
import { promises } from 'node:fs';
import fs from 'fs-extra';
import path from 'node:path';
import {
  getEntryPoint,
  getPluginOptions,
  INDEX_HTML,
  resolveViteConfig,
  findVotPlugin,
} from '../utils';
import { BuildOptions } from '../../vot';
import type {
  RollupOutput,
  RollupWatcher,
  OutputAsset,
  OutputOptions,
} from 'rollup';
import { generate } from '../generate';

export async function build(inlineBuildOptions: BuildOptions = {}) {
  return new Promise(async (resolve) => {
    const viteConfig = await resolveViteConfig();
    const findVotPluginResult = findVotPlugin(viteConfig.plugins);

    if (!findVotPluginResult) {
      throw new Error('missing vot plugin.');
    }

    const isGenerate = findVotPluginResult.generateOptions.mode !== 'off';
    const definePlugin = replace({
      preventAssignment: true,
      values: {
        __VOT_GENERATE__: () => JSON.stringify(isGenerate),
      },
    });

    const distDir =
      viteConfig.build?.outDir ?? path.resolve(process.cwd(), 'dist');

    await fs.emptyDir(distDir);

    const { input: inputFilePath = '', build: pluginBuildOptions = {} } =
      getPluginOptions(viteConfig);

    const defaultFilePath = path.resolve(viteConfig.root, INDEX_HTML);
    const inputFileName = inputFilePath.split('/').pop() || INDEX_HTML;

    let indexHtmlTemplate = '';

    const clientBuildOptions = mergeConfig(
      {
        build: {
          outDir: path.resolve(distDir, 'client'),
          ssrManifest: true,
          emptyOutDir: false,

          // Custom input path
          rollupOptions:
            inputFilePath && inputFilePath !== defaultFilePath
              ? {
                  input: inputFilePath,
                  plugins: [
                    definePlugin,
                    inputFileName !== INDEX_HTML && {
                      generateBundle(options, bundle) {
                        // Rename custom name to index.html
                        const htmlAsset = bundle[inputFileName];
                        delete bundle[inputFileName];
                        htmlAsset.fileName = INDEX_HTML;
                        bundle[INDEX_HTML] = htmlAsset;
                      },
                    },
                  ],
                }
              : {
                  plugins: [definePlugin],
                },
        },
      } as InlineConfig,
      mergeConfig(
        pluginBuildOptions.clientOptions || {},
        inlineBuildOptions.clientOptions || {},
      ),
    ) as NonNullable<BuildOptions['clientOptions']>;

    const serverBuildOptions = mergeConfig(
      {
        publicDir: false, // No need to copy public files to SSR directory
        build: {
          outDir: path.resolve(distDir, 'server'),
          // The plugin is already changing the vite-ssr alias to point to the server-entry.
          // Therefore, here we can just use the same entry point as in the index.html
          ssr: await getEntryPoint(viteConfig),
          emptyOutDir: false,
          rollupOptions: {
            plugins: [
              replace({
                preventAssignment: true,
                values: {
                  __VOT_HTML__: () => indexHtmlTemplate,
                },
              }),
              definePlugin,
            ],
          },
        },
      } as InlineConfig,
      mergeConfig(
        pluginBuildOptions.serverOptions || {},
        inlineBuildOptions.serverOptions || {},
      ),
    ) as NonNullable<BuildOptions['serverOptions']>;

    const clientResult = await viteBuild(clientBuildOptions);

    const isWatching = Object.prototype.hasOwnProperty.call(
      clientResult,
      '_maxListeners',
    );

    if (isWatching) {
      // This is a build watcher
      const watcher = clientResult as RollupWatcher;
      let resolved = false;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      watcher.on('event', async ({ result }) => {
        if (result) {
          // This piece runs everytime there is
          // an updated frontend bundle.
          result.close();

          // Re-read the index.html in case it changed.
          // This content is not included in the virtual bundle.
          indexHtmlTemplate = await promises.readFile(
            (clientBuildOptions.build?.outDir as string) + `/${INDEX_HTML}`,
            'utf-8',
          );

          // Build SSR bundle with the new index.html
          await viteBuild(serverBuildOptions);
          await generatePackageJson(
            viteConfig,
            clientBuildOptions,
            serverBuildOptions,
          );

          if (!resolved) {
            resolve(null);
            resolved = true;
          }
        }
      });
    } else {
      // This is a normal one-off build
      const clientOutputs = (
        Array.isArray(clientResult)
          ? clientResult
          : [clientResult as RollupOutput]
      ).flatMap((result) => result.output);

      // Get the index.html from the resulting bundle.
      indexHtmlTemplate = (
        clientOutputs.find(
          (file) => file.type === 'asset' && file.fileName === INDEX_HTML,
        ) as OutputAsset
      )?.source as string;

      await viteBuild(serverBuildOptions);

      // index.html file is not used in SSR and might be
      // served by mistake.
      // Let's remove it unless the user overrides this behavior.
      if (!pluginBuildOptions.keepIndexHtml) {
        await promises
          .unlink(
            path.join(clientBuildOptions.build?.outDir as string, 'index.html'),
          )
          .catch(() => null);
      }

      await generatePackageJson(
        viteConfig,
        clientBuildOptions,
        serverBuildOptions,
      );

      await generate(viteConfig);

      resolve(null);
    }
  });
}

async function generatePackageJson(
  viteConfig: ResolvedConfig,
  clientBuildOptions: InlineConfig,
  serverBuildOptions: NonNullable<BuildOptions['serverOptions']>,
) {
  if (serverBuildOptions.packageJson === false) return;

  const outputFile = (
    serverBuildOptions.build?.rollupOptions?.output as OutputOptions
  )?.file;

  const ssrOutput = path.parse(
    outputFile ||
      ((viteConfig.build?.ssr || serverBuildOptions.build?.ssr) as string),
  );

  const packageJson = {
    exports: outputFile ? ssrOutput.base : ssrOutput.name + '.js', // Vite 3.0 default
    type: 'module', // Vite 3.0 default
    ssr: {
      // This can be used later to serve static assets
      assets: (
        await promises.readdir(clientBuildOptions.build?.outDir as string)
      ).filter((file) => !/(index\.html|manifest\.json)$/i.test(file)),
    },
    ...(serverBuildOptions.packageJson || {}),
  };

  await promises.writeFile(
    path.join(serverBuildOptions.build?.outDir as string, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8',
  );
}

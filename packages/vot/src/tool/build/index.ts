import {
  build as viteBuild,
  InlineConfig,
  ResolvedConfig,
  mergeConfig,
  type Rolldown,
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
import { generate } from '../generate';
import { resolveServerEntryPath, SERVER_ENTRY_OUTPUT } from '../server-entry';

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

    const serverEntryPath = resolveServerEntryPath(
      viteConfig.root,
      getPluginOptions(viteConfig).server?.entry,
    );

    /**
     * Bundle the server entry next to the SSR bundle.
     *
     * Same externals policy as the SSR build, so `dist/server` stays the whole
     * runtime surface: `vot serve` reads this instead of `vite.config.ts`.
     * Output names are namespaced because both builds write to the same
     * directory with `emptyOutDir: false`.
     */
    const serverEntryBuildOptions: InlineConfig | undefined = serverEntryPath
      ? mergeConfig(
          {
            publicDir: false,
            build: {
              outDir: path.resolve(distDir, 'server'),
              ssr: serverEntryPath,
              emptyOutDir: false,
              rollupOptions: {
                output: {
                  entryFileNames: SERVER_ENTRY_OUTPUT,
                  chunkFileNames: 'vot.server-[hash].js',
                },
              },
            },
          } as InlineConfig,
          pluginBuildOptions.serverOptions || {},
        )
      : undefined;

    const clientResult = await viteBuild(clientBuildOptions);

    const isWatching = Object.prototype.hasOwnProperty.call(
      clientResult,
      '_maxListeners',
    );

    if (isWatching) {
      // This is a build watcher
      const watcher = clientResult as Rolldown.RolldownWatcher;
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
            `${clientBuildOptions.build?.outDir as string}/${INDEX_HTML}`,
            'utf-8',
          );

          // Build SSR bundle with the new index.html
          await viteBuild(serverBuildOptions);
          if (serverEntryBuildOptions) {
            await viteBuild(serverEntryBuildOptions);
          }
          await generatePackageJson(
            viteConfig,
            clientBuildOptions,
            serverBuildOptions,
            !!serverEntryBuildOptions,
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
          : [clientResult as Rolldown.RolldownOutput]
      ).flatMap((result) => result.output);

      // Get the index.html from the resulting bundle.
      indexHtmlTemplate = (
        clientOutputs.find(
          (file) => file.type === 'asset' && file.fileName === INDEX_HTML,
        ) as Rolldown.OutputAsset
      )?.source as string;

      await viteBuild(serverBuildOptions);

      if (serverEntryBuildOptions) {
        await viteBuild(serverEntryBuildOptions);
      }

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
        !!serverEntryBuildOptions,
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
  hasServerEntry: boolean,
) {
  if (serverBuildOptions.packageJson === false) return;

  const outputFile = (
    serverBuildOptions.build?.rollupOptions?.output as Rolldown.OutputOptions
  )?.file;

  const ssrOutput = path.parse(
    outputFile ||
      ((viteConfig.build?.ssr || serverBuildOptions.build?.ssr) as string),
  );

  const packageJson = {
    exports: outputFile ? ssrOutput.base : `${ssrOutput.name}.js`, // Vite 3.0 default
    type: 'module', // Vite 3.0 default
    // `vot serve` mounts its router here. Recorded at build time because the
    // client bundle already has this baked into its asset URLs -- it is not an
    // environment-derived value the server entry may disagree about.
    base: viteConfig.base,
    // Presence of this is what makes `vot serve` skip `vite.config.ts`.
    ...(hasServerEntry
      ? { server: { entry: SERVER_ENTRY_OUTPUT } }
      : undefined),
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

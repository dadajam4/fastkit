import * as esbuild from 'esbuild';
import type { BuildOptions, Message, Plugin } from 'esbuild';
import path from 'node:path';
import nodemon from 'nodemon';
import { logger } from './logger';
import { nodeExternalPlugin } from './esbuild-plugin';
import { NodepackOptions } from './schemes';
import { inferPackageFormat } from '@fastkit/node-util';

function log(type: 'warn' | 'error', messages: Message[]) {
  messages.forEach(({ text, detail, location }) => {
    logger[type](`${type}: `, text, detail);
    if (location) {
      logger[type](
        `path: ${location.file}:${location.line}:${location.column}`,
      );
      logger[type](` -> `, location.lineText);
    }
  });
}

interface ResolvedBuildOptions extends BuildOptions {
  outfile: string;
  plugins: Plugin[];
}

function resolveOptions(opts: NodepackOptions): ResolvedBuildOptions {
  const { sourcemap = true, target, define, nodeExternals, minify } = opts;
  let { entry, dest } = opts;
  if (!path.isAbsolute(entry)) {
    entry = path.resolve(entry);
  }
  const { name: entryName } = path.parse(entry);

  if (!path.isAbsolute(dest)) {
    dest = path.resolve(dest);
  }

  let destDir: string;
  let format: 'esm' | 'cjs';

  if (/\.(c|m)?js/.test(dest)) {
    destDir = path.dirname(dest);
    format = inferPackageFormat(destDir, dest);
  } else {
    destDir = dest;
    format = inferPackageFormat(destDir);
    const ext = format === 'esm' ? 'mjs' : 'cjs';
    dest = path.join(destDir, `${entryName}.${ext}`);
  }

  return {
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      ...define,
    },
    target: target || format === 'esm' ? 'esnext' : undefined,
    ...(format === 'cjs'
      ? {
          platform: 'node',
        }
      : undefined),
    format,
    entryPoints: [entry],
    outfile: dest,
    color: true,
    bundle: true,
    minify,
    sourcemap,
    plugins: [nodeExternalPlugin(nodeExternals)],
  };
}

export async function nodepack(opts: NodepackOptions) {
  const buildOptions = resolveOptions({
    minify: true,
    ...opts,
  });

  return esbuild
    .build(buildOptions)
    .then((result) => {
      logger.info('==================================================');
      logger.info(new Date().toLocaleString(), `Compiled...`);
      return result;
    })
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}

nodepack.watch = async function watch(opts: NodepackOptions) {
  let demon: typeof nodemon | undefined;
  const buildOptions = resolveOptions(opts);

  function run() {
    if (!demon) {
      demon = nodemon({
        script: buildOptions.outfile,
      }).on('quit', process.exit);
    } else {
      demon.restart();
    }
    return demon;
  }

  const context = await esbuild.context({
    ...buildOptions,
    plugins: [
      ...buildOptions.plugins,
      {
        name: 'on-end',
        setup(build) {
          build.onStart(() => {
            logger.info('==================================================');
            logger.info(new Date().toLocaleString(), `Compile start...`);
          });

          build.onEnd((result) => {
            const { errors, warnings } = result;
            if (
              errors.some((error) => error.text === 'The service was stopped')
            ) {
              process.exit();
            }

            if (errors.length) {
              logger.error(
                '--------------------------------------------------',
              );
              logger.error(`${new Date().toLocaleString()} ERROR`);
              log('error', errors);
            }

            if (warnings.length) {
              logger.warn('--------------------------------------------------');
              logger.warn(`${new Date().toLocaleString()} WARNING`);
              log('warn', warnings);
            }

            if (!result) {
              process.exit();
            }

            if (!errors.length) {
              run();
            }
          });
        },
      },
    ],
  });

  context.watch();

  return {
    context,
    get demon() {
      return demon;
    },
  };
};

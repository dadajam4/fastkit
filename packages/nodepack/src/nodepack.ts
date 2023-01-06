import * as esbuild from 'esbuild';
import type { BuildOptions, Message } from 'esbuild';
import path from 'path';
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

export async function nodepack(opts: NodepackOptions) {
  const {
    watch: isWatch,
    sourcemap = true,
    target,
    define,
    nodeExternals,
  } = opts;
  const isBuild = !isWatch;
  let { entry, dest, minify } = opts;
  if (minify === undefined) {
    minify = isBuild;
  }
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

  let demon: typeof nodemon | undefined;

  function run() {
    if (!isWatch) return;
    if (!demon) {
      demon = nodemon({
        script: dest,
      }).on('quit', process.exit);
    } else {
      demon.restart();
    }
    return demon;
  }

  const buildOptions: BuildOptions = {
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
    incremental: !isWatch,
    plugins: [nodeExternalPlugin(nodeExternals)],
  };

  if (isWatch) {
    buildOptions.watch = {
      onRebuild: (error, result) => {
        if (error && error.message === 'The service was stopped') {
          process.exit();
        }
        const errors = error ? error.errors : (result && result.errors) || [];
        const warnings = error
          ? error.warnings
          : (result && result.warnings) || [];

        if (errors.length) {
          logger.error('--------------------------------------------------');
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

        if (!errors.length && !warnings.length) {
          logger.info('rebuilding...');
        }
        run();
      },
    };
  }

  process.on('SIGINT', process.exit);

  const build = await esbuild
    .build(buildOptions)
    .then((result) => {
      if (!result) return;
      if (isBuild) {
        logger.info('==================================================');
        logger.info(new Date().toLocaleString(), `Compiled...`);
        process.exit();
      }
      logger.info('==================================================');
      logger.info(new Date().toLocaleString(), `Compile start...`);
      run();
      return result;
    })
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
  return {
    get build() {
      return build;
    },
    get demon() {
      return demon;
    },
  };
}

import { RollupOptions, OutputOptions, Plugin } from 'rollup';
import { RollupReplaceOptions } from '@rollup/plugin-replace';
import path from 'node:path';
import ts from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import { ROOT_DIR, PACKAGES_DIR, getPackage } from './utils';
import { BuildOptions, BuildType } from './schemes';
import { rawStylesPlugin } from '../core/raw-styles';
import vueJsx from '@vitejs/plugin-vue-jsx';
import postcss from 'rollup-plugin-postcss';
import chalk from 'chalk';

const TARGET: string | undefined = process.env.TARGET;
const COMMIT: string | undefined = process.env.COMMIT;
const NODE_ENV: string | undefined = process.env.NODE_ENV;
const FORMATS: string | undefined = process.env.FORMATS;
const PROD_ONLY: string | undefined = process.env.PROD_ONLY;
const SOURCE_MAP: string | undefined = process.env.SOURCE_MAP;
const TOOL: string | undefined = process.env.TOOL;
const __DEV__: string | undefined = process.env.__DEV__;

if (!TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.');
}

const mainPackage = getPackage();
const mainVersion = mainPackage.version;
const packageDir = PACKAGES_DIR.join(TARGET);
const name = path.basename(packageDir);
const resolve = (p: string) => path.resolve(packageDir, p);
const pkg = getPackage(resolve(`package.json`));
const packageOptions: BuildOptions = pkg.buildOptions || {};

// ensure TS checks only once for each build
let hasTSChecked = false;

interface NormalizedOutputOptions extends Omit<OutputOptions, 'file'> {
  file: string;
}

const outputConfigs: Record<BuildType, NormalizedOutputOptions> = {
  'esm-bundler': {
    file: resolve(`dist/${name}.mjs`),
    format: `es`,
  },
  // cjs: {
  //   file: resolve(`dist/${name}.cjs`),
  //   format: `cjs`,
  // },
};

// const defaultFormats: BuildType[] = ['esm-bundler', 'cjs'];
const defaultFormats: BuildType[] = ['esm-bundler'];
const inlineFormats = FORMATS && (FORMATS.split(',') as BuildType[]);
const packageFormats =
  inlineFormats || packageOptions.formats || defaultFormats;
const packageConfigs = PROD_ONLY
  ? []
  : packageFormats.map((format) => createConfig(format, outputConfigs[format]));

if (NODE_ENV === 'production') {
  packageFormats.forEach((format) => {
    if (packageOptions.prod === false) {
      return;
    }
    // if (format === 'cjs') {
    //   packageConfigs.push(createProductionConfig(format));
    // }
  });
}
if (!!TOOL) {
  packageConfigs.push(
    createConfig(
      'esm-bundler',
      // 'cjs',
      {
        file: resolve(`dist/tool/index.mjs`),
        format: 'es',
        // format: `cjs`,
      },
      [],
      `src/tool/index.ts`,
    ),
  );
}

export default packageConfigs;

function createConfig(
  format: BuildType,
  output: NormalizedOutputOptions,
  plugins: Plugin[] = [],
  entryFile = `src/index.ts`,
): RollupOptions {
  const _plugins = [...plugins];
  if (!output) {
    console.log(chalk.yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.sourcemap = !!SOURCE_MAP;
  output.externalLiveBindings = false;

  const isProductionBuild =
    __DEV__ === 'false' || /\.prod\./.test(output.file || '');
  const isBundlerESMBuild = /esm-bundler/.test(format);
  // const isNodeBuild = format === 'cjs';

  // const shouldEmitDeclarations = process.env.TYPES != null && !hasTSChecked;
  const shouldEmitDeclarations = true;
  const tsPlugin = ts({
    check: NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: ROOT_DIR.join('tsconfig.json'),
    cacheRoot: ROOT_DIR.join('node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
      exclude: [
        '**/__tests__',
        'test-dts',
        'core',
        'plugins',
        'vite.config.ts',
        'site',
        'docs',
      ],
    },
  });

  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true;

  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...['path', 'url', 'stream'],
  ];

  external.push(
    'bezier-easing',
    'module',
    'crypto',
    '@vueuse/head',
    'chokidar',
    'prosemirror-commands',
    'prosemirror-keymap',
    'prosemirror-model',
    'prosemirror-schema-list',
    'prosemirror-state',
    'prosemirror-transform',
    'prosemirror-view',
    'prosemirror-history',
    'prosemirror-dropcursor',
    'prosemirror-gapcursor',
    '@tiptap/core',
    '@tiptap/extension-link',
    '@tiptap/starter-kit',
    '@tiptap/extension-underline',
    '@tiptap/vue-3',
    '@tiptap/extension-bullet-list',
    '@tiptap/extension-bold',
    '@tiptap/extension-italic',
    '@tiptap/extension-history',
    '@tiptap/extension-ordered-list',
    '@tiptap/extension-link',
    'esbuild',
    'vite',
    'postcss',
    'nanoid',
    '@datadog/browser-logs',
    'nodemon',
    'http-proxy',
    'virtual:generated-pages',
    'fs',
    'fs-extra',
    'http',
    'perf_hooks',
    'imask',
    'cookie',
    'set-cookie-parser',
    'execa',
    'folder-hash',
    'eta',
    'imagemin-pngquant',
    'imagemin-mozjpeg',
    'imagemin',
    'webfont',
    'cac',
    'chalk',
  );

  // const nodePlugins =
  //   format !== 'cjs'
  //     ? [
  //         require('@rollup/plugin-commonjs')({
  //           sourceMap: false,
  //         }),
  //         require('rollup-plugin-polyfill-node')(),
  //         require('@rollup/plugin-node-resolve').nodeResolve(),
  //       ]
  //     : [];
  const nodePlugins: any[] = [];

  const externalRe = /^(vue|@fastkit|node:)/;

  if (packageOptions.rawStyles) {
    _plugins.push(rawStylesPlugin(packageOptions.rawStyles));
  }

  const postcssPlugin = postcss({
    extract: `${name}${isProductionBuild ? '.min' : ''}.css`,
    minimize: isProductionBuild,
    sourceMap: isProductionBuild,
  });

  return {
    input: resolve(entryFile),
    external(id) {
      return external.includes(id) || externalRe.test(id);
    },
    plugins: [
      {
        name: '__skip-resolveDirective__',
        options: (options) => {
          options.onwarn = (warn, defaultHandler) => {
            if (
              warn.code === 'UNUSED_EXTERNAL_IMPORT' &&
              warn.names &&
              warn.names.length === 1 &&
              warn.names[0] === 'resolveDirective'
            ) {
              return;
            }
            defaultHandler(warn);
          };
          return options;
        },
      },
      json({
        namedExports: false,
      }),
      tsPlugin,
      vueJsx(),
      postcssPlugin,
      createReplacePlugin(isProductionBuild, isBundlerESMBuild),
      ...nodePlugins,
      ..._plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg.message)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  };
}

function createReplacePlugin(
  isProduction: boolean,
  isBundlerESMBuild: boolean,
  // isNodeBuild: boolean,
) {
  const replacements: RollupReplaceOptions['values'] = {
    __COMMIT__: `"${COMMIT}"`,
    __VERSION__: `"${mainVersion}"`,
    __PLAY__: String(false),
    __DEV__: isBundlerESMBuild
      ? // preserve to be handled by bundlers
        `(process.env.NODE_ENV !== 'production')`
      : // hard coded dev/prod builds
        String(!isProduction),
    // this is only used during Fastkit's internal tests
    __TEST__: String(false),
    __ESM_BUNDLER__: String(isBundlerESMBuild),
    // is targeting Node (SSR)?
    // __NODE_JS__: String(isNodeBuild),
  };
  // allow inline overrides like
  //__RUNTIME_COMPILE__=true yarn build runtime-core
  Object.keys(replacements).forEach((key) => {
    if (key in process.env) {
      const v = process.env[key];
      if (v !== undefined) {
        replacements[key] = v;
      }
    }
  });
  return replace({
    values: replacements,
    preventAssignment: true,
  });
}

// function createProductionConfig(format: BuildType) {
//   return createConfig(format, {
//     file: resolve(`dist/${name}.prod.${format}`),
//     format: outputConfigs[format].format,
//   });
// }

// function createMinifiedConfig(format: BuildType) {
//   const { terser } = require('rollup-plugin-terser') as {
//     terser: (options?: TerserOptions) => Plugin;
//   };
//   return createConfig(
//     format,
//     {
//       file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
//       format: outputConfigs[format].format,
//     },
//     [
//       terser({
//         module: /^esm/.test(format),
//         compress: {
//           ecma: 2015,
//           pure_getters: true,
//         },
//         safari10: true,
//       }),
//     ],
//   );
// }

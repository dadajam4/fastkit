import { RollupOptions, OutputOptions, Plugin } from 'rollup';
import { RollupReplaceOptions } from '@rollup/plugin-replace';
import path from 'path';
import ts from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import { ROOT_DIR, PACKAGES_DIR, getPackage } from './utils';
import { BuildOptions, BuildType } from './schemes';
import { Options as TerserOptions } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { rawStylesPlugin } from '../plugins/raw-styles';
import vueJsx from '@vitejs/plugin-vue-jsx';
import postcss from 'rollup-plugin-postcss';
// import styles from 'rollup-plugin-styles';

const TARGET: string | undefined = process.env.TARGET;
const COMMIT: string | undefined = process.env.COMMIT;
const NODE_ENV: string | undefined = process.env.NODE_ENV;
const FORMATS: string | undefined = process.env.FORMATS;
// const TYPES: string | undefined = process.env.TYPES;
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
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`,
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`,
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`,
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`,
  },
  // // runtime-only builds, for main "fastkit" package only
  // 'esm-bundler-runtime': {
  //   file: resolve(`dist/${name}.runtime.esm-bundler.js`),
  //   format: `es`,
  // },
  // 'esm-browser-runtime': {
  //   file: resolve(`dist/${name}.runtime.esm-browser.js`),
  //   format: 'es',
  // },
  // 'global-runtime': {
  //   file: resolve(`dist/${name}.runtime.global.js`),
  //   format: 'iife',
  // },
};

const defaultFormats: BuildType[] = ['esm-bundler', 'cjs'];
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
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format));
    }
    if (/^(global|esm-browser)/.test(format)) {
      packageConfigs.push(createMinifiedConfig(format));
    }
  });
}
if (!!TOOL) {
  packageConfigs.push(
    createConfig(
      'cjs',
      {
        file: resolve(`dist/tool/index.js`),
        format: `cjs`,
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
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.sourcemap = !!SOURCE_MAP;
  output.externalLiveBindings = false;

  const isProductionBuild =
    __DEV__ === 'false' || /\.prod\.js$/.test(output.file || '');
  const isBundlerESMBuild = /esm-bundler/.test(format);
  const isBrowserESMBuild = /esm-browser/.test(format);
  const isNodeBuild = format === 'cjs';
  const isGlobalBuild = /global/.test(format);

  if (isGlobalBuild) {
    output.name = packageOptions.name;
  }

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
        'packages/_docs',
      ],
    },
  });

  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true;

  // const entryFile = `src/index.ts`;

  const external =
    isGlobalBuild || isBrowserESMBuild
      ? packageOptions.enableNonBrowserBranches
        ? []
        : // normal browser builds - non-browser only imports are tree-shaken,
          // they are only listed here to suppress warnings.
          ['source-map', '@babel/parser', 'estree-walker']
      : // Node / esm-bundler builds. Externalize everything.
        [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
          ...['path', 'url', 'stream'],
        ];
  external.push(
    'module',
    '@vueuse/head',
    'chokidar',
    'esbuild',
    'vite',
    'postcss',
    'nanoid',
    '@datadog/browser-logs',
    '@nuxt',
    'nuxt3',
  );

  // the browser builds requires postcss to be available
  // as a global (e.g. http://wzrd.in/standalone/postcss)
  output.globals = {
    postcss: 'postcss',
  };

  const nodePlugins =
    packageOptions.enableNonBrowserBranches && format !== 'cjs'
      ? [
          require('@rollup/plugin-commonjs')({
            sourceMap: false,
          }),
          require('rollup-plugin-polyfill-node')(),
          require('@rollup/plugin-node-resolve').nodeResolve(),
        ]
      : [];

  const externalRe =
    isGlobalBuild || isBrowserESMBuild ? /^(vue)/ : /^(vue|@fastkit)/;

  // if (packageOptions.styles) {
  //   _plugins.push(styles(packageOptions.styles));
  // }
  if (packageOptions.legacy && isGlobalBuild) {
    _plugins.push(
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: 'usage',
              corejs: 3,
              ignoreBrowserslistConfig: true,
              targets: {
                browsers: ['IE 11'],
              },
            },
          ],
        ],
        extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', 'ts', 'tsx'],
        babelHelpers: 'bundled',
        exclude: ['node_modules/@babel/**', 'node_modules/core-js/**'],
        plugins: [
          require('@babel/plugin-transform-arrow-functions'),
          require('@babel/plugin-proposal-class-properties'),
          require('@babel/plugin-transform-template-literals'),
        ],
      }),
    );
  }

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
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external(id) {
      return external.includes(id) || externalRe.test(id);
    },
    plugins: [
      json({
        namedExports: false,
      }),
      tsPlugin,
      vueJsx(),
      postcssPlugin,
      createReplacePlugin(
        isProductionBuild,
        isBundlerESMBuild,
        isBrowserESMBuild,
        // isBrowserBuild?
        (isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild) &&
          !packageOptions.enableNonBrowserBranches,
        isGlobalBuild,
        isNodeBuild,
      ),
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
  isBrowserESMBuild: boolean,
  isBrowserBuild: boolean,
  isGlobalBuild: boolean,
  isNodeBuild: boolean,
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
    // If the build is expected to run directly in the browser (global / esm builds)
    __BROWSER__: isBundlerESMBuild
      ? `(typeof document !== 'undefined')`
      : String(isBrowserBuild),
    __GLOBAL__: String(isGlobalBuild),
    __ESM_BUNDLER__: String(isBundlerESMBuild),
    __ESM_BROWSER__: String(isBrowserESMBuild),
    // is targeting Node (SSR)?
    __NODE_JS__: String(isNodeBuild),
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

function createProductionConfig(format: BuildType) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format,
  });
}

function createMinifiedConfig(format: BuildType) {
  const { terser } = require('rollup-plugin-terser') as {
    terser: (options?: TerserOptions) => Plugin;
  };
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true,
        },
        safari10: true,
      }),
    ],
  );
}

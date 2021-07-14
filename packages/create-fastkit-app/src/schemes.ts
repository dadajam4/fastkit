import path from 'path';

export const PACKAGE_TYPES = ['frontend', 'backend', 'other'] as const;

export type PackageType = typeof PACKAGE_TYPES[number];

export interface FastkitAppPackageConfig {
  name: string;
  src: string;
  dirName: string;
  dest: string;
  type: PackageType;
  vue?: boolean;
  port?: number;
  proxy?: boolean;
  description: string;
  dependencies?: string[];
}

export interface FastkitAppConfig {
  name: string;
  dest: string;

  /**
   * @default process.version
   * e.g. 16.0.0
   */
  nodeVersion: string;

  eslint: {
    name: string;
  };

  packageList: FastkitAppPackageConfig[];
  packages: {
    [key: string]: FastkitAppPackageConfig;
  };
  dependencies: {
    [pkg: string]: string;
  };
  vue: boolean;
  overwrite?: boolean;
}

export const DEPENDENCIE_VERSION_MAP: {
  [pkg: string]: string;
} = require(path.resolve(__dirname, '../templates/dependencies.json'));

export const DEFAULT_DEPENDENCIES: string[] = [
  'yorkie',
  '@types/jest',
  '@types/node',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'jest',
  'ts-jest',
  'eslint',
  'eslint-config-prettier',
  'eslint-html-parser',
  'eslint-plugin-prettier',
  'postcss',
  'prettier',
  'sass',
  'stylelint',
  'stylelint-config-css-modules',
  'stylelint-config-prettier',
  'stylelint-config-standard',
  'stylelint-prettier',
  'stylelint-scss',
  'typescript',
  'vite',
  '@fastkit/stylelint-config',
];

export const VUE_DEPENDENCIES: string[] = [
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx',
  '@vue/compiler-sfc',
  '@vue/server-renderer',
  '@vueuse/head',
  'eslint-plugin-vue',
  'vue',
  'vue-router',
];

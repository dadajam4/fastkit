import { Options as AutoprefixerOptions } from 'autoprefixer';

export type BuildType = 'esm-bundler' | 'esm-browser' | 'cjs' | 'global';
// | 'esm-bundler-runtime'
// | 'esm-browser-runtime'
// | 'global-runtime'

export interface BuildOptions {
  env?: 'development' | 'production';
  formats?: BuildType[];
  prod?: boolean;
  name?: string;
  enableNonBrowserBranches?: boolean;
  // styles?: StylesOptions;
  rawStyles?: {
    autoprefixer?: AutoprefixerOptions;
  };
  legacy?: boolean;
  tool?: boolean;
}

export interface FastkitPackage {
  private?: boolean;
  name: string;
  description?: string;
  version: string;
  types: string;
  author: string;
  license: string;
  repository: {
    type: string;
    url: string;
  };
  homepage: string;
  bugs: {
    url: string;
  };
  keywords: string[];
  main?: string;
  module?: string;
  files?: string[];
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  buildOptions?: BuildOptions;
}

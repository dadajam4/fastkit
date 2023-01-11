import { Options as AutoprefixerOptions } from 'autoprefixer';

/**
 * Bundle Type
 *
 * - `"esm-bundler"` ES Modules for universal
 * - `"cjs"` CommonJS
 * - `"global"` Global build For CDN Install
 */
// export type BuildType = 'esm-bundler' /* | 'esm-browser'*/ | 'cjs'; // | 'global';
export type BuildType = 'esm-bundler'; // /* | 'esm-browser'*/ | 'cjs'; // | 'global';
// | 'esm-bundler-runtime'
// | 'esm-browser-runtime'
// | 'global-runtime'

export type BuildHook = 'after';

/**
 * Package Build Configuration
 */
export interface BuildOptions {
  /**
   * Set to `true` if you want to skip the build
   *
   * * Used for things like lintter configurations
   */
  ignore?: boolean;

  /** @FIXME これ何だったっけ、、？？？ */
  env?: 'development' | 'production';

  /**
   * List of formats to be bundled
   *
   * @see {@link BuildType}
   */
  formats?: BuildType[];

  /** @FIXME これ何だったっけ、、？？？ */
  prod?: boolean;

  /** Global object name of bundle for CDN installation */
  name?: string;

  /** Build settings to be passed to the css raw loader process */
  rawStyles?: {
    autoprefixer?: AutoprefixerOptions;
  };

  /** Set to `true` if the package provides tools (cli) */
  tool?: boolean;

  hooks?: Partial<Record<BuildHook, string[]>>;
}

/**
 * Configuration for package documentation
 */
export interface PackageDocsOptions {
  /**
   * Name for package display
   */
  displayName?: string;

  /**
   * If the package is heavily dependent on a particular execution environment or framework, the identifier
   *
   * @example "node" | "vue" ...
   */
  scope?: string;

  /**
   * Identifier of the feature of the package
   *
   * @example "i18n" | "icon" ...
   */
  feature?: string;

  /**
   * Package Overview (Multilingual Map)
   */
  description: Partial<Record<'en' | 'ja', string>>;
}

/**
 * Interface of package.json belonging to fastkit
 */
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
  exports?: Record<string, any>;
  module?: string;
  files?: string[];
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;

  /** Package Build Configuration */
  buildOptions?: BuildOptions;

  /** Configuration for package documentation */
  _docs?: PackageDocsOptions;
}

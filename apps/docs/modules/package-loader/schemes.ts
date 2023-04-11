import { WorkspacePackageJson } from '@fastkit/plugboy';

export const PACKAGE_DOC_LOCALES = ['en', 'ja'] as const;

export type PackageDocLocale = (typeof PACKAGE_DOC_LOCALES)[number];

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
  description: Partial<Record<PackageDocLocale, string>>;
}

/**
 * Interface of package.json belonging to fastkit
 */
export interface FastkitPackage extends WorkspacePackageJson {
  /** Configuration for package documentation */
  _docs?: PackageDocsOptions;
}

/**
 * Dependent Package Information
 */
export interface PackageDep {
  /** Package Name */
  name: string;

  /** Version */
  version: string;
}

/**
 * Package Information
 */
export interface PackageInfo
  extends Pick<
      FastkitPackage,
      'version' | 'repository' | 'homepage' | 'keywords'
    >,
    PackageDocsOptions {
  /**
   * Package Name
   *
   * * `@fastkit/` namespace omitted
   */
  name: string;

  /**
   * Full name of package
   *
   * * Identical to the name listed in package.json
   */
  fullName: string;

  /** list of dependent packages for development */
  devDependencies: PackageDep[];

  /** Dependent Package List */
  dependencies: PackageDep[];

  /** List of packages you would like us to use with you */
  peerDependencies: PackageDep[];
}

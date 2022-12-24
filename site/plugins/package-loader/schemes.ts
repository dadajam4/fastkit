import type { FastkitPackage, PackageDocsOptions } from '../../../core/schemes';

export type { FastkitPackage } from '../../../core/schemes';

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

import { FASTKIT_AUTHOR } from '../../../../core/constants';

/**
 * Package Information
 */
export interface DocsLayoutPackageInfo {
  /**
   * Package name (Name in package.json without namespace prefix)
   */
  name: string;

  /**
   * Name for package display
   */
  displayName?: string;
}

/**
 * Resolved Package Information
 */
export interface ResolvedDocsLayoutPackageInfo extends DocsLayoutPackageInfo {
  /**
   * Name for package display
   */
  displayName: string;

  /**
   * Github url
   */
  github: string;

  /**
   * Document Page Home Path
   */
  home: string;
}

export interface DocsLayoutPackageOptions {
  /**
   * Document Page Home Path
   */
  home?: string;
}

export function resolveDocsLayoutPackageInfo(
  pkg: DocsLayoutPackageInfo | string = 'fastkit',
  options: DocsLayoutPackageOptions = {},
): ResolvedDocsLayoutPackageInfo {
  const input: DocsLayoutPackageInfo =
    typeof pkg === 'string' ? { name: pkg } : pkg;
  const { name } = input;
  const { displayName = name } = input;
  const githubBase = `https://github.com/${FASTKIT_AUTHOR}/fastkit`;
  const github = `${githubBase}${
    name === 'fastkit' ? '' : `/tree/main/packages/${name}#readme`
  }`;
  const { home = `/${name}` } = options;

  return {
    name,
    displayName,
    github,
    home,
  };
}

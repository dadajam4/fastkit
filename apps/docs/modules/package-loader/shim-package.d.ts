declare const PackageInfo: Awaited<import('./schemes').PackageInfo>;

declare const PackageProvide: Awaited<
  import('./package-provide').PackageProvide
>;

declare const _VPackageProvider: Awaited<
  typeof import('./components/VPackageProvider/VPackageProvider').VPackageProvider
>;

declare module 'virtual:package-provider:*' {
  export const pkg: typeof PackageInfo;
  export const VPackageProvider: typeof _VPackageProvider;
  export default VPackageProvider;
}

declare module 'virtual:package:*' {
  const pkg: typeof PackageInfo;
  export default pkg;
}

declare module 'virtual:packages' {
  const packages: (typeof PackageInfo)[];
  export default packages;
}

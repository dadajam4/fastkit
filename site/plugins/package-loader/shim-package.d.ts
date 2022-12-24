declare const PackageInfo: Awaited<import('./schemes').PackageInfo>;

declare const VueComponent: Awaited<import('vue').DefineComponent>;

declare module 'virtual:package-provider:*' {
  export const pkg: typeof PackageInfo;
  export const VPackageProvider: typeof VueComponent;
  export default VueComponent;
}

declare module 'virtual:package:*' {
  const pkg: typeof PackageInfo;
  export default pkg;
}

declare module 'virtual:packages' {
  const packages: typeof PackageInfo[];
  export default packages;
}

declare module '*.$types.json' {
  type SourceFileExports = import('./dist/ts-tiny-meta').SourceFileExports;

  /**
   * xxxxx
   * @see {@link SourceFileExports}
   */
  const exports: SourceFileExports;

  export default exports;
}

declare module '*/$types.json' {
  type SourceFileExports = import('./dist/ts-tiny-meta').SourceFileExports;

  /**
   * xxxxx
   * @see {@link SourceFileExports}
   */
  const exports: SourceFileExports;

  export default exports;
}

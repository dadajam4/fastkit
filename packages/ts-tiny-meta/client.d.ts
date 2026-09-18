declare module '*.$types.json' {
  type SourceFileExports = import('@fastkit/ts-tiny-meta').SourceFileExports;

  /**
   * The meta-information extracted for the source file this JSON was generated
   * from.
   *
   * @see {@link SourceFileExports}
   */
  const exports: SourceFileExports;

  export default exports;
}

declare module '*/$types.json' {
  type SourceFileExports = import('@fastkit/ts-tiny-meta').SourceFileExports;

  /**
   * The meta-information extracted for the source file this JSON was generated
   * from.
   *
   * @see {@link SourceFileExports}
   */
  const exports: SourceFileExports;

  export default exports;
}

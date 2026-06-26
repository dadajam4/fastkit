declare global {
  /**
   * Whether the code is running in a development context.
   *
   * @remarks
   * - `stub`: always `true`.
   * - published `build`: replaced with a runtime check of the consumer's
   *   environment (`process.env.NODE_ENV === 'development'` or
   *   `import.meta.env.DEV === true`), so the branch is evaluated at the
   *   consumer's runtime rather than eliminated.
   */
  const __PLUGBOY_DEV__: boolean;

  /**
   * The bundle is in stub mode.
   *
   * @remarks In stub mode, source code is executed in the source directory. This flag is available because of the different way of loading files in relative paths.
   */
  const __PLUGBOY_STUB__: boolean;
}

export {};

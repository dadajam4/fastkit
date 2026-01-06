declare global {
  /**
   * Development bundle or not
   *
   * @remarks This feature is still under development and is currently only `true` in stub mode.
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

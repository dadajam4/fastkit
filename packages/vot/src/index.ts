export * from '@fastkit/vue-page';
export * from './schemes';
export * from './plugin';
export * from './injections';

declare global {
  /**
   * Bundle (page) is built in generate mode.
   */
  const __VOT_GENERATE__: boolean;

  /**
   * ID of the element that mounts the Vot application
   * @internal
   */
  const __VOT_CONTAINER_ID__: string;

  /**
   * Vot application base URL string
   * @internal
   */
  const __VOT_BASE__: string;
}

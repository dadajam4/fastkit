import { AsyncHandler } from './handler';
import { AsyncFn, AsyncHandlerOptions } from './schemes';

/**
 * A decorator that wraps "AsyncHandler" functionality in the specified asynchronous process.
 *
 * @param options - TConfigure behavior when incorporating this asynchronous support into a function.
 *
 * @see {AsyncHandler}
 */
export function AsyncHandle<Fn extends AsyncFn>(
  options: AsyncHandlerOptions<Fn> = {},
) {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<Fn>,
  ) => {
    let controller: AsyncHandler<Fn> | undefined;
    const func = descriptor.value as unknown as Fn;

    descriptor.value = function (this: any, ...args: Parameters<Fn>) {
      if (!controller) {
        controller = new AsyncHandler<Fn>(func, {
          thisObj: this,
          ...options,
        });
      }
      return controller.handler(...args);
    } as Fn;
  };
}

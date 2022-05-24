import { AsyncController } from './controller';
import { AsyncFn } from './schemes';

/**
 * A decorator that wraps "AsyncController" functionality in the specified asynchronous process.
 *
 * @see {AsyncController}
 */
export function AsyncControl<Fn extends AsyncFn>() {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<Fn>,
  ) => {
    let controller: AsyncController<Fn> | undefined;
    const func = descriptor.value as unknown as Fn;

    descriptor.value = function (this: any, ...args: Parameters<Fn>) {
      if (!controller) {
        controller = new AsyncController<Fn>(func, this);
      }
      return controller.handler(...args);
    } as Fn;
  };
}

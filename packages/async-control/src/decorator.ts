import { AsyncHandler } from './handler';
import { AsyncFn, AsyncHandlerOptions } from './schemes';

export const ASYNC_HANDLER_SYMBOL = Symbol();

/**
 * A function that wraps the original function.
 */
export type AsyncHandlerDecoratedFn<Fn extends AsyncFn> = Fn & {
  [ASYNC_HANDLER_SYMBOL]: AsyncHandler<Fn>;
};

/**
 * A decorator that wraps "AsyncHandler" functionality in the specified asynchronous process.
 *
 * @param options - TConfigure behavior when incorporating this asynchronous support into a function.
 *
 * @see {@link AsyncHandler}
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const originalFn = descriptor.value!;

    const controller = new AsyncHandler<Fn>(null as any, options);

    function decoratedFn(this: any, ...args: Parameters<Fn>) {
      controller.originalFunc = originalFn;
      controller.thisObj = this;
      return controller.handler(...args);
    }

    (decoratedFn as AsyncHandlerDecoratedFn<Fn>)[ASYNC_HANDLER_SYMBOL] =
      controller;

    descriptor.value = decoratedFn as Fn;
  };
}

AsyncHandle.getHandler = getAsyncHandler;

/**
 * Retrieves Asynchronous processing handler from the specified asynchronous function.
 * If the controller is not found, an exception is thrown.
 *
 * @param func - function.
 */
export function getAsyncHandler<Fn extends AsyncFn>(func: Fn) {
  const controller = (func as AsyncHandlerDecoratedFn<Fn>)[
    ASYNC_HANDLER_SYMBOL
  ];
  if (!controller) {
    throw new Error('missing async controller.');
  }
  return controller;
}

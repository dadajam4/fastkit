import { createCatcherResolver } from '../schemes';

// const NativeErrorConstructors = [
//   EvalError,
//   RangeError,
//   ReferenceError,
//   SyntaxError,
//   TypeError,
//   URIError,
//   Error,
// ] as const;

// type NativeErrorConstructor = typeof NativeErrorConstructors[number];

// function isNativeErrorConstructor(
//   source: unknown,
// ): source is NativeErrorConstructor {
//   return NativeErrorConstructors.includes(source as any);
// }

export interface NativeErrorOverrides {
  // isNativeError: boolean;
  // message: string;
  // stack?: string;
  // name: string;
  nativeError?: Error;
}

export const nativeErrorResolver = createCatcherResolver(
  function nativeErrorResolver(
    source: unknown,
    // source: string | InstanceType<NativeErrorConstructor>,
  ): NativeErrorOverrides | undefined {
    // if (typeof source === 'string') {
    //   source = new Error(source);
    // }
    if (source && source instanceof Error) {
      return {
        nativeError: source,
      };
      // const { constructor } = source;
      // if (isNativeErrorConstructor(constructor)) {
      //   const { message, stack, name } = source;
      //   return { message, stack, name, isNativeError: true };
      // }
    }
  },
);

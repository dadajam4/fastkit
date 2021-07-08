const NativeErrorConstructors = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  Error,
] as const;

type NativeErrorConstructor = typeof NativeErrorConstructors[number];

function isNativeErrorConstructor(
  source: unknown,
): source is NativeErrorConstructor {
  return NativeErrorConstructors.includes(source as any);
}

export interface NativeErrorOverrides {
  isNativeError: boolean;
  message: string;
  stack?: string;
  name: string;
}

export function nativeErrorResolver(
  source: InstanceType<NativeErrorConstructor>,
): NativeErrorOverrides | undefined {
  if (source && source instanceof Error) {
    const { constructor } = source;
    if (isNativeErrorConstructor(constructor)) {
      const { message, stack, name } = source;
      return { message, stack, name, isNativeError: true };
    }
  }
}

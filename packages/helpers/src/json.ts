export type JSONPrimitiveValue = string | number | boolean | null | undefined;

export type JSONData = JSONPrimitiveValue | JSONPrimitiveValue[] | JSONMapValue;

export type JSONMapValue = { [key: string]: JSONData };

export function safeJSONStringify<T>(
  obj: T,
  replacer?: (this: any, key: string, value: any) => any,
  spaces?: string | number,
  cycleReplacer?: (this: any, key: string, value: any) => any,
) {
  return JSON.stringify(
    obj,
    safeJSONSerializer(replacer, cycleReplacer),
    spaces,
  );
}

export function safeJSONSerializer(
  replacer?: (this: any, key: string, value: any) => any,
  cycleReplacer?: (this: any, key: string, value: any) => any,
) {
  const stack: any[] = [];
  const keys: string[] = [];

  if (cycleReplacer == null)
    cycleReplacer = function (this: any, key: string, value: any) {
      if (stack[0] === value) return '[Circular ~]';
      return (
        '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
      );
    };

  return function (this: any, key: string, value: any) {
    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (~stack.indexOf(value)) value = cycleReplacer!.call(this, key, value);
    } else stack.push(value);

    return replacer == null ? value : replacer.call(this, key, value);
  };
}

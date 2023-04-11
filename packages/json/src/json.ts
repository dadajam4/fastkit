/**
 * Primitive Value Types in JSON
 */
export type JSONPrimitiveValue = string | number | boolean | null | undefined;

/**
 * Value types in JSON
 */
export type JSONData = JSONPrimitiveValue | JSONPrimitiveValue[] | JSONMapValue;

/**
 * Map type in JSON
 */
export type JSONMapValue = { [key: string]: JSONData };

type Replacer = (this: any, key: string, value: any) => any;

type Serializer = (this: any, key: string, value: any) => any;

/**
 * Safely serialize a JSON object to a string
 *
 * @param obj - JSON object to serialize
 * @param replacer - If the value is to be replaced, its replacement function
 * @param spaces - Number of indentations
 * @param cycleReplacer - Value replacement function when recursive calls are detected
 * @returns JSON String
 */
export function safeJSONStringify<T>(
  obj: T,
  replacer?: Replacer,
  spaces?: string | number,
  cycleReplacer?: Replacer,
) {
  return JSON.stringify(
    obj,
    safeJSONSerializer(replacer, cycleReplacer),
    spaces,
  );
}

let _defaultCycleReplacer: Replacer | undefined;

/**
 * Serializer for safely stringifying JSON objects
 *
 * @param replacer - If the value is to be replaced, its replacement function
 * @param cycleReplacer - Value replacement function when recursive calls are detected
 * @returns serialize function
 */
export function safeJSONSerializer(
  replacer?: Replacer,
  cycleReplacer?: Replacer,
): Serializer {
  const stack: any[] = [];
  const keys: string[] = [];

  if (cycleReplacer == null) {
    if (!_defaultCycleReplacer) {
      _defaultCycleReplacer = function (this: any, key: string, value: any) {
        if (stack[0] === value) return '[Circular ~]';
        return (
          '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
        );
      };
    }
    cycleReplacer = _defaultCycleReplacer;
  }

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

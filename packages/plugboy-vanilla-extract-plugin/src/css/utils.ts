/* eslint-disable no-console */
import { Contract, MapLeafNodes, CSSVarFunction } from './types';

type Primitive = string | number | null | undefined;

type Walkable = {
  [Key in string | number]: Primitive | Walkable;
};

export function get(obj: any, path: Array<string>) {
  let result = obj;

  for (const key of path) {
    if (!(key in result)) {
      throw new Error(`Path ${path.join(' -> ')} does not exist in object`);
    }
    result = result[key];
  }

  return result;
}
export function walkObject<T extends Walkable, MapTo>(
  obj: T,
  fn: (value: Primitive, path: Array<string>) => MapTo,
  path: Array<string> = [],
): MapLeafNodes<T, MapTo> {
  const clone = obj.constructor();

  for (const key in obj) {
    const value = obj[key];
    const currentPath = [...path, key];

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value == null
    ) {
      clone[key] = fn(value as Primitive, currentPath);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      clone[key] = walkObject(value as Walkable, fn, currentPath);
    } else {
      console.warn(
        `Skipping invalid key "${currentPath.join(
          '.',
        )}". Should be a string, number, null or object. Received: "${
          Array.isArray(value) ? 'Array' : typeof value
        }"`,
      );
    }
  }

  return clone;
}

export function assignVars<VarContract extends Contract>(
  varContract: VarContract,
  tokens: MapLeafNodes<VarContract, string>,
): Record<CSSVarFunction, string> {
  const varSetters: { [cssVarName: string]: string } = {};
  // const { valid, diffString } = validateContract(varContract, tokens);

  // if (!valid) {
  //   throw new Error(`Tokens don't match contract.\n${diffString}`);
  // }

  walkObject(tokens, (value, path) => {
    varSetters[get(varContract, path)] = String(value);
  });

  return varSetters;
}

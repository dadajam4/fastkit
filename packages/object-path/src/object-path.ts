type AnyField = keyof any;

type GenericObject = Record<AnyField, unknown>;

type Join<
  L extends AnyField | undefined,
  R extends AnyField | undefined,
> = L extends string | number
  ? R extends string | number
    ? `${L}.${R}`
    : L
  : R extends string | number
  ? R
  : undefined;

type Union<
  L extends unknown | undefined,
  R extends unknown | undefined,
  Leaf extends boolean = false,
> = L extends undefined
  ? R extends undefined
    ? undefined
    : R
  : R extends undefined
  ? L
  : Leaf extends true
  ? R
  : L | R;

/**
 * NestedPaths
 * Get all the possible paths of an object
 * @example
 * type Keys = NestedPaths<{ a: { b: { c: string } }>
 * // 'a' | 'a.b' | 'a.b.c'
 *
 * @example
 * type Keys = NestedPaths<{ a: { b: { c: string } }, true>
 * // 'a.b.c'
 */
export type NestedObjectPaths<
  T extends GenericObject,
  Leaf extends boolean = false,
  Prev extends AnyField | undefined = undefined,
  Path extends AnyField | undefined = undefined,
> = {
  [K in keyof T]: T[K] extends GenericObject
    ? NestedObjectPaths<T[K], Leaf, Union<Prev, Path>, Join<Path, K>>
    : Union<Union<Prev, Path>, Join<Path, K>, Leaf>;
}[keyof T];

/**
 * TypeFromPath
 * Get the type of the element specified by the path
 * @example
 * type TypeOfAB = TypeFromPath<{ a: { b: { c: string } }, 'a.b'>
 * // { c: string }
 */
export type TypeFromObjectPath<
  T extends GenericObject,
  Path extends string, // Or, if you prefer, NestedPaths<T>
> = {
  [K in Path]: K extends keyof T
    ? T[K]
    : K extends `${infer P}.${infer S}`
    ? T[P] extends GenericObject
      ? TypeFromObjectPath<T[P], S>
      : never
    : never;
}[Path];

// export function valueFromObjectPath<
//   T extends GenericObject,
//   Path extends NestedObjectPaths<T>, // Or, if you prefer, NestedPaths<T>
// >(obj: T, objectPath: Path): TypeFromObjectPath<T, Path> {
//   return null as unknown as TypeFromObjectPath<T, Path>;
// }

export function objectValueGetter<
  T extends GenericObject,
  Paths = NestedObjectPaths<T>,
>(obj: T) {
  return function get<
    Path extends Paths,
    Value = Path extends string ? TypeFromObjectPath<T, Path> : never,
  >(path: Path): Value {
    return null as any;
  };
}

// export function valueFromObjectPath<
//   T extends GenericObject,
//   // Path extends NestedObjectPaths<T>, // Or, if you prefer, NestedPaths<T>
//   Path extends NestedObjectPaths<T>, // Or, if you prefer, NestedPaths<T>
// >(
//   obj: T,
//   objectPath: Path,
// ): Path extends string ? TypeFromObjectPath<T, Path> : never {
//   return null as any;
// }

// const hoge = {
//   a: '1',
//   b: {
//     b2: true,
//   },
// };

// const getter = objectValueGetter(hoge);
// const fuga2 = getter('b.b2');

// type Hoge = typeof hoge;

// type Result = TypeFromObjectPath<Hoge, 'b'>;

// const fuga = objectValueGetter(hoge)('a');

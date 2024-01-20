/* eslint-disable no-shadow */
import { ObjectEmitsOptions, EmitsOptions } from 'vue';

import { UnionToIntersection } from '@fastkit/ts-type-utils';

/**
 * Define an event up corresponding to the specified generics type
 */
export function defineEmitsOptions<
  EmitsOptions extends Readonly<ObjectEmitsOptions>,
>(): EmitsOptions;

/**
 * Define event up
 */
export function defineEmitsOptions<
  EmitsOptions extends Readonly<ObjectEmitsOptions>,
>(opts: EmitsOptions): EmitsOptions;

export function defineEmitsOptions<
  EmitsOptions extends Readonly<ObjectEmitsOptions>,
>(opts?: EmitsOptions): EmitsOptions {
  return opts as any;
}

/**
 * Emitter
 *
 * * Union emitter function type generated from object-like event options specified by generics.
 *
 * @example
 * ```
 * { a: (arg: string) => any; b: (arg: number) => any; }
 * // ↓
 * (ev: 'a', arg: string) & (ev: 'b', arg: number)
 *
 * { a: [arg: string]; b: [arg: number]; }
 * // ↓
 * (ev: 'a', arg: string) & (ev: 'b', arg: number)
 *
 * { (e: 'a', arg: string): any; (e: 'b', arg: number): any; }
 * // ↓
 * (ev: 'a', arg: string) & (ev: 'b', arg: number)
 * ```
 */
export type EmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options,
> =
  Options extends Array<infer V>
    ? (event: V, ...args: any[]) => void
    : {} extends Options
      ? (event: string, ...args: any[]) => void
      : Options extends (...args: any[]) => any
        ? Options
        : UnionToIntersection<
            {
              [key in Event]: Options[key] extends (...args: infer Args) => any
                ? (event: key, ...args: Args) => void
                : Options[key] extends any[]
                  ? (event: key, ...args: Options[key]) => void
                  : (event: key, ...args: any[]) => void;
            }[Event]
          >;

type ShortEmitsToProps<E extends Record<string, any[]>> = {
  [K in `on${Capitalize<string & keyof E>}`]?: K extends `on${infer C}`
    ? E[Uncapitalize<C>] extends null
      ? (...args: any[]) => any
      : (...args: E[Uncapitalize<C>]) => any
    : never;
};

/**
 * Convert an emit option specified by a type argument to a property IF like `onXXX`.
 */
export type EmitsToProps<T extends EmitsOptions | Record<string, any[]>> =
  T extends string[]
    ? {
        [K in string & `on${Capitalize<T[number]>}`]?: (...args: any[]) => any;
      }
    : T extends ObjectEmitsOptions
      ? {
          [K in string &
            `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
            ? T[Uncapitalize<C>] extends null
              ? (...args: any[]) => any
              : (
                  ...args: T[Uncapitalize<C>] extends (..._args: infer P) => any
                    ? P
                    : never
                ) => any
            : never;
        }
      : T extends Record<string, any[]>
        ? ShortEmitsToProps<T>
        : {};

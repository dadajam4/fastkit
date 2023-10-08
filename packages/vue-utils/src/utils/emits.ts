import { ObjectEmitsOptions } from 'vue';

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
 * (ev: 'a', arg: string) | (ev: 'b', arg: number)
 * ```
 */
export type EmitFn<
  Options extends ObjectEmitsOptions,
  Event extends keyof Options = keyof Options,
> = UnionToIntersection<
  {
    [key in Event]: Options[key] extends (...args: infer Args) => any
      ? (event: key, ...args: Args) => void
      : (event: key, ...args: any[]) => void;
  }[Event]
>;

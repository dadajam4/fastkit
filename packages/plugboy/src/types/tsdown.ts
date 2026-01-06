import { type NoExternalFn } from 'tsdown';

type Arrayable<T> = T | T[];

export type NoExternalOption = Arrayable<string | RegExp> | NoExternalFn;

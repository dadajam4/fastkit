import { type NoExternalFn, type DepsConfig } from 'tsdown';

type Arrayable<T> = T | T[];

export type NoExternalOption = Arrayable<string | RegExp> | NoExternalFn;

export type ExternalOption = NonNullable<DepsConfig['neverBundle']>;

export { type TsdownPlugin } from 'tsdown';

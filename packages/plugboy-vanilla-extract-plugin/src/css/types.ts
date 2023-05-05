import { createVar } from '@vanilla-extract/css';

export type CSSVarFunction = ReturnType<typeof createVar>;

type NullableTokens = {
  [key: string]: string | NullableTokens | null;
};

export type Tokens = {
  [key: string]: string | Tokens;
};

export type Contract = {
  [key: string]: CSSVarFunction | null | Contract;
};

type Primitive = string | boolean | number | null | undefined;

export type MapLeafNodes<Obj, LeafType> = {
  [Prop in keyof Obj]: Obj[Prop] extends Primitive
    ? LeafType
    : Obj[Prop] extends Record<string | number, any>
    ? MapLeafNodes<Obj[Prop], LeafType>
    : never;
};

export type ThemeVars<ThemeContract extends NullableTokens> = MapLeafNodes<
  ThemeContract,
  CSSVarFunction
>;

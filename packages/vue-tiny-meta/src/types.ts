/**
 * @file Types that are roughly compatible with the following
 * https://github.com/vue-styleguidist/vue-styleguidist/blob/09592b0d1d2db24e2d1701b34560694f23c763a2/packages/vue-inbrowser-compiler-independent-utils/src/types.ts#L46
 */

import { MetaDoc, CustomMeta } from '@fastkit/ts-tiny-meta';

export interface ComponentDescription {
  exportName: string;
  optionName?: string;
  sourceFile: string;
}

export interface BaseMeta {
  // name: string;
  description?: string;
  type: {
    name: string;
  };
  docs: MetaDoc[];
  sourceFile: string;
}

export interface PropMeta extends BaseMeta {
  name: string;
  required: boolean;
  defaultValue?: {
    value: string;
  };
  values?: string[];
  docs: MetaDoc[];
}

export interface EventMeta extends BaseMeta {
  name: `on${string}`;
}

export interface SlotMeta extends BaseMeta {
  name: `v-slot:${string}`;
  required: boolean;
  docs: MetaDoc[];
}

export type AnyPropMeta = PropMeta | EventMeta | SlotMeta;

export interface ComponentMeta {
  displayName: string;
  exportName: string;
  description?: string;
  props: PropMeta[];
  slots: SlotMeta[];
  events: EventMeta[];
  docs: MetaDoc[];
  sourceFile: {
    path: string;
    line: number;
  };
}

export type IgnoreRule = string | RegExp | ((name: string) => boolean | void);

export type Filter = (name: string) => boolean;

export type UserFilter =
  | IgnoreRule[]
  | ((baseRules: IgnoreRule[]) => IgnoreRule[] | void);

export interface ResolverContext {
  component: ComponentDescription;
}

export type PropResolver = (
  prop: PropMeta,
  context: ResolverContext,
) => PropMeta | false | null | void;

export type EventResolver = (
  event: EventMeta,
  context: ResolverContext,
) => EventMeta | false | null | void;

export type SlotResolver = (
  slot: SlotMeta,
  context: ResolverContext,
) => SlotMeta | false | null | void;

export interface Resolvers {
  prop?: PropResolver | PropResolver[];
  event?: EventResolver | EventResolver[];
  slot?: SlotResolver | SlotResolver[];
}

export interface ResolvedResolvers {
  prop?: PropResolver[];
  event?: EventResolver[];
  slot?: SlotResolver[];
}

export type SortFn = (a: AnyPropMeta, b: AnyPropMeta) => number;

export type SortOption = boolean | string[] | SortFn;

export interface SerializeVueOptions {
  ignoreProps?: UserFilter;
  ignoreEvents?: UserFilter;
  ignoreSlots?: UserFilter;
  resolvers?: Resolvers | Resolvers[];
  sort?: SortOption;
}

export type VueComponentMeta = CustomMeta<ComponentMeta>;

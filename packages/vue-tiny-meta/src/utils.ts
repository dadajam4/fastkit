import {
  IgnoreRule,
  Filter,
  UserFilter,
  Resolvers,
  ResolvedResolvers,
  PropResolver,
  EventResolver,
  SlotResolver,
  ResolverContext,
} from './types';
import { Symbol as MorphSymbol, Node } from '@fastkit/ts-tiny-meta/ts-morph';
import {
  SourceFileExporter,
  _extractMetaDocs,
  getMetaDocsBySymbol,
} from '@fastkit/ts-tiny-meta/ts';
import { VUE_BUILTIN_PROPS } from './constants';

export function filterByRules(name: string, rules: IgnoreRule[]) {
  if (name.startsWith('_') || name.startsWith('$')) return false;
  for (const rule of rules) {
    if (typeof rule === 'string') {
      if (name === rule) return false;
    } else if (rule instanceof RegExp) {
      if (rule.test(name)) return false;
    } else {
      if (rule(name) === false) return false;
    }
  }
  return true;
}

filterByRules.build = function build(rules: IgnoreRule[]): Filter {
  return (name: string) => filterByRules(name, rules);
};

export function capitalize<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

export function getMetaDocsByNodeAndSymbol(
  exporter: SourceFileExporter,
  node: Node | undefined,
  symbol: MorphSymbol,
) {
  let docs = node ? _extractMetaDocs(exporter, node) : [];
  if (docs.length === 0) {
    docs = getMetaDocsBySymbol(exporter, symbol);
  }
  return docs;
}

export const BASE_IGNORE_RULES: IgnoreRule[] = [...VUE_BUILTIN_PROPS, /^v-/];

export function resolveUserFilter(
  userFilter: UserFilter | undefined,
  baseRules: IgnoreRule[] = BASE_IGNORE_RULES,
): Filter {
  // if (!userFilter) return () => true;
  const computedIgnore =
    typeof userFilter === 'function'
      ? userFilter(baseRules) || baseRules
      : userFilter;

  return filterByRules.build(computedIgnore || baseRules);
}

export function trimCommonSubstring(source: string, compare: string): string {
  const length = Math.min(source.length, compare.length);
  let commonSubstring = '';

  for (let i = 0; i < length; i++) {
    const sourceChar = source[i];
    if (sourceChar !== compare[i]) break;
    commonSubstring += sourceChar;
  }

  return source.replace(commonSubstring, '');
}

export function resolveResolvers(
  resolvers: Resolvers | Resolvers[] | undefined,
): ResolvedResolvers {
  const result: ResolvedResolvers = {};
  if (!resolvers) return result;
  const rows = Array.isArray(resolvers) ? resolvers : [resolvers];
  for (const row of rows) {
    const entries = Object.entries(row) as [keyof ResolvedResolvers, any][];
    for (const [key, _fns] of entries) {
      const fns = Array.isArray(_fns) ? _fns : [_fns];
      if (fns.length) {
        if (!result[key]) result[key] = [];
        result[key]?.push(...fns);
      }
    }
  }
  return result;
}

type AnyResolver = PropResolver | EventResolver | SlotResolver;

export function applyResolvers<R extends AnyResolver, D = Parameters<R>[0]>(
  data: D,
  context: ResolverContext,
  resolvers: R[] | undefined,
): D | false {
  if (!resolvers || !resolvers.length) return data;
  for (const resolver of resolvers) {
    const resolved = resolver(data as any, context);
    if (resolved === false || resolved === null) return false;
    if (resolved) data = resolved as any;
  }
  return data;
}

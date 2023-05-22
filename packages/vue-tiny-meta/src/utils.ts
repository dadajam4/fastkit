import { IgnoreRule, Filter, UserFilter } from './types';
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

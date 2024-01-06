import {
  Resolvers,
  PropResolver,
  EventResolver,
  SlotResolver,
  AnyPropMeta,
} from '../types';

type ScopeMatcher = RegExp | ((meta: AnyPropMeta) => boolean);

type PropMap = Record<string, PropResolver | string>;

type EventMap = Record<string, EventResolver | string>;

type SlotMap = Record<string, SlotResolver | string>;

export interface ScopedResolversSettings {
  scope?: ScopeMatcher;
  props?: {
    ignore?: string[];
    resolve?: PropMap;
  };
  events?: {
    ignore?: string[];
    resolve?: EventMap;
  };
  slots?: {
    ignore?: string[];
    resolve?: SlotMap;
  };
}

export function createScopedResolvers(
  settings: ScopedResolversSettings,
): Resolvers {
  const resolvers: Resolvers = {};
  const { scope = () => true, props, events, slots } = settings;
  const test =
    typeof scope === 'function'
      ? scope
      : (meta: AnyPropMeta) => scope.test(meta.sourceFile);

  if (props) {
    const { ignore, resolve: map } = props;
    resolvers.prop = (meta, ctx) => {
      if (!test(meta)) return;
      const { name } = meta;
      if (ignore && ignore.includes(name)) return false;
      if (!map) return;
      const resolve = map[name];
      if (resolve) {
        if (typeof resolve === 'string') {
          meta.description = resolve;
          return;
        }
        return resolve(meta, ctx);
      }
    };
  }

  if (events) {
    const { ignore, resolve: map } = events;
    resolvers.event = (meta, ctx) => {
      if (!test(meta)) return;
      const { name } = meta;
      if (ignore && ignore.includes(name)) return false;
      if (!map) return;
      const resolve = map[name];
      if (resolve) {
        if (typeof resolve === 'string') {
          meta.description = resolve;
          return;
        }
        return resolve(meta, ctx);
      }
    };
  }

  if (slots) {
    const { ignore, resolve: map } = slots;
    resolvers.slot = (meta, ctx) => {
      if (!test(meta)) return;
      const { name } = meta;
      if (ignore && ignore.includes(name)) return false;
      if (!map) return;
      const resolve = map[name];
      if (resolve) {
        if (typeof resolve === 'string') {
          meta.description = resolve;
          return;
        }
        return resolve(meta, ctx);
      }
    };
  }

  return resolvers;
}

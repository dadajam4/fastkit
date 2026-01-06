import {
  type ChunkAddon,
  type ChunkAddonObject,
  type ChunkAddonFunction,
} from 'tsdown';
import { type ExternalOption } from 'rolldown';
import { NoExternalOption } from '../types';

type ChunkAddonFunctionARGS = Parameters<ChunkAddonFunction>;

type MergeChunkAddonPosition = 'before' | 'after';

const _stringChunkToObject = (
  source: string | ChunkAddonObject,
): ChunkAddonObject => {
  if (typeof source === 'object') return source;

  return {
    js: source,
    dts: source,
    css: source,
  } satisfies Required<ChunkAddonObject>;
};

const _resolveChunkAddonToObject = (
  source: ChunkAddon,
  ...args: ChunkAddonFunctionARGS
): ChunkAddonObject => {
  const tmp = typeof source === 'function' ? source(...args) || {} : source;
  return _stringChunkToObject(tmp);
};

const _mergeChunkAddonObjects = (
  base: string | ChunkAddonObject,
  override: string | ChunkAddonObject,
  position: MergeChunkAddonPosition = 'after',
): ChunkAddonObject => {
  const result = { ..._stringChunkToObject(base) };
  for (const [_key, value] of Object.entries(_stringChunkToObject(override))) {
    if (!value) continue;
    const key = _key as keyof ChunkAddonObject;
    const baseValue = result[key];
    const chunks = [value];
    if (baseValue) {
      if (position === 'before') {
        chunks.push(baseValue);
      } else {
        chunks.unshift(baseValue);
      }
    }
    result[key] = chunks.join('\n\n');
  }
  return result;
};

export function mergeChunkAddons(
  base: ChunkAddon | undefined,
  override: ChunkAddon | undefined,
  position?: MergeChunkAddonPosition,
): ChunkAddon | undefined {
  if (!override) return base;
  if (!base) return override;

  if (typeof base === 'function' || typeof override === 'function') {
    return (...args) => {
      const _base = _resolveChunkAddonToObject(base, ...args);
      const _override = _resolveChunkAddonToObject(override, ...args);
      return _mergeChunkAddonObjects(_base, _override, position);
    };
  }

  return _mergeChunkAddonObjects(base, override);
}

type NullValue<T = void> = T | undefined | null | void;

function isExternal(
  externalOption: ExternalOption,
  id: string,
  parentId: string | undefined,
  isResolved: boolean,
): NullValue<boolean> {
  if (Array.isArray(externalOption)) {
    return externalOption.some((e) => isExternal(e, id, parentId, isResolved));
  }
  if (typeof externalOption === 'string') return id === externalOption;
  if (externalOption instanceof RegExp) return externalOption.test(id);
  if (typeof externalOption === 'function')
    return externalOption(id, parentId, isResolved);
  return false;
}

export function mergeExternals(
  base: ExternalOption | undefined,
  override: ExternalOption | undefined,
): ExternalOption | undefined {
  if (!override) return base;
  if (!base) return override;

  const externals = [base, override];

  return (id, parentId, isResolved) => {
    return externals.some((external) => {
      return isExternal(external, id, parentId, isResolved);
    });
  };
}

function isNoExternal(
  noExternalOption: NoExternalOption,
  id: string,
  importer: string | undefined,
): NullValue<boolean> {
  if (Array.isArray(noExternalOption)) {
    return noExternalOption.some((e) => isNoExternal(e, id, importer));
  }
  if (typeof noExternalOption === 'string') return id === noExternalOption;
  if (noExternalOption instanceof RegExp) return noExternalOption.test(id);
  if (typeof noExternalOption === 'function')
    return noExternalOption(id, importer);
  return false;
}

export function mergeNoExternals(
  base: NoExternalOption | undefined,
  override: NoExternalOption | undefined,
): NoExternalOption | undefined {
  if (!override) return base;
  if (!base) return override;

  if (typeof base !== 'function' && typeof override !== 'function') {
    const _base = Array.isArray(base) ? base.slice() : [base];
    const _override = Array.isArray(override) ? override.slice() : [override];
    return [..._base, ..._override];
  }

  const noExternals = [base, override] as const;

  return (id, importer) => {
    return noExternals.some((spec) => {
      return isNoExternal(spec, id, importer);
    });
  };
}

import { SourceFileExports, RefQuery, AnyMeta } from './types';

type AnyObject = Record<keyof any, any>;

type AnyArray = any[];

type RefQueries = SourceFileExports['refs'];

function createMetaGetter(refs: RefQueries) {
  function isAnyObject(source: unknown): source is AnyObject {
    return !!source && typeof source === 'object';
  }

  function isRefQuery(source: unknown): source is RefQuery {
    return (
      isAnyObject(source) && typeof (source as RefQuery)._refId === 'string'
    );
  }

  function getRefQueryId(source: unknown): string | undefined {
    if (isRefQuery(source)) {
      return source._refId;
    }
  }

  function getMeta(idOrRefOrMeta: string | RefQuery | AnyMeta): AnyMeta {
    if (typeof idOrRefOrMeta === 'string')
      return wrapObject(refs[idOrRefOrMeta]);
    if (isRefQuery(idOrRefOrMeta))
      return wrapObject(refs[idOrRefOrMeta._refId]);
    return wrapObject(idOrRefOrMeta);
  }

  function wrapArray<T extends AnyArray = AnyArray>(array: T): T {
    const wraped = array.map((row) => {
      const refId = getRefQueryId(row);
      if (refId) return getMeta(refId);
      if (isAnyObject(row)) {
        return wrapObject(row);
      }
      return row;
    }) as T;
    return wraped;
  }

  function wrapObject<T extends AnyObject>(obj: T): T {
    const wraped = {} as T;
    Object.entries(obj).forEach(([key, value]) => {
      Object.defineProperty(wraped, key, {
        enumerable: true,
        get() {
          if (Array.isArray(value)) {
            return wrapArray(value);
          }
          if (isAnyObject(value)) {
            return wrapObject(value);
          }
          return value;
        },
      });
    });
    return wraped;
  }

  return getMeta;
}

const CREATE_META_GETTER_FN_STRING = createMetaGetter
  .toString()
  .replace(/^([^/(]+)/, 'function $__createMetaGetter');

export function hydrateExports<T extends Record<any, any>>(
  source: SourceFileExports,
): T {
  const result = {} as T;
  const getMeta = createMetaGetter(source.refs);
  Object.entries(source.exports).forEach(([exportName, value]) => {
    Object.defineProperty(result, exportName, {
      enumerable: true,
      get: () => (Array.isArray(value) ? value.map(getMeta) : getMeta(value)),
    });
  });
  return result;
}

const REFS_SYMBOL_NAME = '$__refs__';
const META_GETTER_FN_NAME = '$__getMata';

export function generateModuleCode(source: SourceFileExports): string {
  const codes: string[] = [
    `const ${REFS_SYMBOL_NAME} = ${JSON.stringify(source.refs)};`,
    '',
    CREATE_META_GETTER_FN_STRING,
    '',
    `const ${META_GETTER_FN_NAME} = $__createMetaGetter(${REFS_SYMBOL_NAME});`,
    '',
  ];

  const toDef = (metaOrQuery: AnyMeta | RefQuery) => {
    return `${META_GETTER_FN_NAME}(${JSON.stringify(metaOrQuery)})`;
  };

  Object.entries(source.exports).forEach(([exportName, value]) => {
    const def = Array.isArray(value)
      ? `[${value.map(toDef).join(' , ')}]`
      : toDef(value);
    codes.push(`export const ${exportName} = ${def};`);
  });

  return codes.join('\n') + '\n';
}

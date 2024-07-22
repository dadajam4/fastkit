import { IN_WINDOW } from './runtime-flags';

let _currentId = 0;

const _getNextId = (): number => {
  _currentId++;
  if (_currentId > Number.MAX_SAFE_INTEGER) {
    _currentId = 1;
  }
  return _currentId;
};

const _cache = new WeakMap<WeakKey, number>();

/**
 * Retrieve a temporary ID for a given object reference.
 *
 * This function creates an ID that corresponds to a given object reference.
 * The ID is not guaranteed to be globally unique and may have duplicates if
 * a large number of IDs are generated within a single process.
 *
 * @param obj - The object for which the temporary ID is generated.
 * @param onlyClient - If `true` is specified, it will return undefined in the server environment.
 * @returns A temporary ID corresponding to the object reference.
 */
export function temporaryObjectID<OnlyClient extends boolean = false>(
  obj: WeakKey,
  onlyClient?: OnlyClient,
): OnlyClient extends true ? number | undefined : number {
  if (onlyClient && !IN_WINDOW) return undefined as any;

  let id = _cache.get(obj);
  if (id === undefined) {
    id = _getNextId();
    _cache.set(obj, id);
  }
  return id;
}

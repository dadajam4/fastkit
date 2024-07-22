import { temporaryObjectID } from '@fastkit/helpers';

/**
 * Retrieve the vnode key for the specified object.
 *
 * The key obtained from this function is intended to be used on the client side.
 * Please note that in non-browser environments, undefined will be returned.
 *
 * @param obj - The object from which to retrieve the key
 * @returns The key for the object
 */
export function getClientIterableKey(obj: WeakKey): number | undefined {
  return temporaryObjectID(obj, true);
}

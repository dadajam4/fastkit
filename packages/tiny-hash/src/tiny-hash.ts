import { safeJSONStringify } from '@fastkit/json';
import { sha256 } from './crypto';
import { cyrb53 } from './cyrb53';

/**
 * Result of hashing an object
 */
export interface ObjectHashResult {
  /** JSON String */
  data: string;
  /** hash string */
  hash: string;
}

/**
 * Hashing Objects
 * @param obj - Objects to be hashed
 * @returns Result of hashing an object
 */
export async function objectHash(obj: any): Promise<ObjectHashResult> {
  const data = safeJSONStringify(obj);
  const hash = await sha256(data);
  return {
    hash,
    data,
  };
}

/**
 * Hashing Objects
 * @remarks Unlike {@link objectHash}, this method does not use {@link Crypto} hash functions in its internal logic.
 * @param obj - Objects to be hashed
 * @returns Result of hashing an object
 */
export function tinyObjectHash(obj: any): ObjectHashResult {
  const data = safeJSONStringify(obj);
  const hash = String(cyrb53(data));
  return {
    hash,
    data,
  };
}

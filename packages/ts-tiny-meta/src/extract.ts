import { AnyMeta } from './types';

/**
 * Extract meta-information for a given type argument
 */
export function extractMeta(): AnyMeta;

/**
 * Extract meta-information for a given argument
 * @param source - Value to be extracted
 */
export function extractMeta<T>(): AnyMeta;

/**
 * Extract meta-information for a given argument
 * @param source - Value to be extracted
 */
export function extractMeta<T>(source: T): AnyMeta;

/**
 * Extract meta-information from specified type argument or arguments
 * @param source - Value to be extracted
 * @returns meta-information
 */
export function extractMeta<T>(source?: T): AnyMeta {
  return undefined as any;
}

type AnyModule = Record<string, any>;

/**
 * Extracts meta-information for all symbols exported by a given module
 * @param module - Promise instance that resolves a module or modules
 * @returns List of meta-information
 *
 * @example
 * ```ts
 * import * as module1 from './module1;
 *
 * export const module1Exports = extractModule(module1);
 * export const module2Exports = extractModule(import('./module2'));
 * ```
 */
export function extractModule(
  module: AnyModule | Promise<AnyModule>,
): AnyMeta[] {
  return undefined as any;
}

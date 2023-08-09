import { Transformer } from '../schemes';
import { Cloner } from '@fastkit/cloner';
import type { ClonerValueProcessor } from '@fastkit/cloner';
export type { ClonerValueProcessor as SanitizeValueProcessor } from '@fastkit/cloner';

/**
 * Filter function to sanitize values
 *
 * @param key - Object Key
 * @param value - Value before sanitization
 */
export type SanitizeFilter = (key: string, value: any) => any;

/**
 * Sanitizing transformer options
 */
export interface SanitizerOptions {
  /** List of {@link SanitizeFilter filter function to sanitize values} */
  filters: SanitizeFilter[];
  /**
   * Value Processor at Clone
   *
   * @see ClonerValueProcessor
   */
  valueProcessor?: ClonerValueProcessor;
}

/**
 * Generating sanitizing transformer
 *
 * - Generates a transformer to recursively sanitize object values
 * - Internal processing uses {@link Cloner}, so processed values are completely cloned and dereferenced
 *
 * @param options - {@link SanitizerOptions Sanitizing transformer options}
 * @returns Log transform function
 */
export function SanitizerTransformer(options: SanitizerOptions): Transformer {
  const { filters, valueProcessor } = options;
  const clone = Cloner({
    keyProcessor: (key, value) => {
      filters.forEach((filter) => {
        value = filter(key, value);
      });
      return value;
    },
    valueProcessor,
  });
  const sanitizerTransformer: Transformer = function sanitizerTransformer(
    payload,
  ) {
    return clone(payload);
  };
  return sanitizerTransformer;
}

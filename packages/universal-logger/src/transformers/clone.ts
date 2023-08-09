import { Transformer } from '../schemes';
import { Cloner, ClonerOptions } from '@fastkit/cloner';
import { SanitizeFilter, SanitizeValueProcessor } from './sanitizer';

/**
 * Clone transformers options
 */
export interface CloneOptions {
  /**
   * List of filter function to sanitize values
   *
   * @see SanitizeFilter
   */
  sanitizers?: SanitizeFilter[];
  /**
   * Value Processor at Clone
   *
   * @see SanitizeValueProcessor
   */
  valueProcessor?: SanitizeValueProcessor;
}

/**
 * Generate clone transformer
 *
 * - Clone and dereference objects contained in the log payload
 * - Optionally sanitize values and perform individual conversions
 *
 * @param options - Clone transformers options
 * @returns Log transform function
 */
export function CloneTransformer(options: CloneOptions = {}): Transformer {
  const { sanitizers, valueProcessor } = options;
  const opts: ClonerOptions = { valueProcessor };
  if (sanitizers) {
    opts.keyProcessor = (key, value) => {
      sanitizers.forEach((sanitizer) => {
        value = sanitizer(key, value);
      });
      return value;
    };
  }
  const clone = Cloner(opts);
  const cloneTransformer: Transformer = function cloneTransformer(payload) {
    return clone(payload);
  };
  return cloneTransformer;
}

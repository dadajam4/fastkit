import { Transformer } from '../schemes';
import { Cloner } from '@fastkit/cloner';
import type { ClonerValueProcesser } from '@fastkit/cloner';
export type { ClonerValueProcesser as SanitizeValueProcesser } from '@fastkit/cloner';

export type SanitizeFilter = (key: string, value: any) => any;

export interface SanitizerOptions {
  filters: SanitizeFilter[];
  valueProcesser?: ClonerValueProcesser;
}

export function SanitizerTransformer(options: SanitizerOptions): Transformer {
  const { filters, valueProcesser } = options;
  const clone = Cloner({
    keyProcesser: (key, value) => {
      filters.forEach((filter) => {
        value = filter(key, value);
      });
      return value;
    },
    valueProcesser,
  });
  const sanitizerTransformer: Transformer = function sanitizerTransformer(
    payload,
  ) {
    return clone(payload);
  };
  return sanitizerTransformer;
}

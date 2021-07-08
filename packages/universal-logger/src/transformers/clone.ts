import { Transformer } from '../schemes';
import { Cloner, ClonerOptions } from '@fastkit/helpers';
import { SanitizeFilter, SanitizeValueProcesser } from './sanitizer';

export interface CloneOptions {
  sanitizers?: SanitizeFilter[];
  valueProcesser?: SanitizeValueProcesser;
}

export function CloneTransformer(options: CloneOptions = {}): Transformer {
  const { sanitizers, valueProcesser } = options;
  const opts: ClonerOptions = { valueProcesser };
  if (sanitizers) {
    opts.keyProcesser = (key, value) => {
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

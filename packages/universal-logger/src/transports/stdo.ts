/* eslint-disable no-console */
import { consoleColorString } from '@fastkit/tiny-logger';
import { safeJSONStringify } from '@fastkit/json';
import {
  Transport,
  LogLevelThreshold,
  DEFAULT_COLOR_LEVEL_MAP,
} from '../schemes';
import { CloneTransformer, CloneOptions } from '../transformers/clone';

export interface STDOTransportSettings {
  level?: LogLevelThreshold;
  clone?: CloneOptions;
  pretty?: boolean;
}

export function STDOTransport(settings: STDOTransportSettings = {}): Transport {
  return {
    level: settings.level,
    transformers: [CloneTransformer(settings.clone)],
    async transport(payload) {
      if (settings.pretty) {
        const color = DEFAULT_COLOR_LEVEL_MAP[payload.level];
        let prefix = `[${payload.level.toUpperCase()}] ${payload.logger.name}`;
        if (color) {
          prefix = consoleColorString(prefix, color);
        }
        console.log(prefix, payload.message, ...payload.args);
      } else {
        console.log(safeJSONStringify(payload));
      }
    },
  };
}

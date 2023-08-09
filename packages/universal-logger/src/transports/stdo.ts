/* eslint-disable no-console */
import { consoleColorString } from '@fastkit/tiny-logger';
import { safeJSONStringify } from '@fastkit/json';
import { Transport, DEFAULT_COLOR_LEVEL_MAP } from '../schemes';
import { CloneTransformer, CloneOptions } from '../transformers/clone';

/**
 * Standard output transport settings
 */
export interface STDOTransportSettings extends Pick<Transport, 'level'> {
  /** {@link CloneOptions Clone transformers options } */
  clone?: CloneOptions;
  /**
   * Format and colorize output at the log level
   *
   * - If this setting is disabled, JSON strings are output as standard output(Use this if your log driver requires JSON output)
   */
  pretty?: boolean;
}

/**
 * Generate standard output transport
 *
 * @param settings - {@link STDOTransportSettings Standard output transport settings}
 * @returns Log transporter
 */
export function STDOTransport(settings?: STDOTransportSettings): Transport {
  return {
    level: settings?.level,
    transformers: [CloneTransformer(settings?.clone)],
    async transport(payload) {
      if (settings?.pretty) {
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

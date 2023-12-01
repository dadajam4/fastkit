import type { datadogLogs, LogsInitConfiguration } from '@datadog/browser-logs';
import { Transport, LogLevel } from '../schemes';
import { CloneTransformer, CloneOptions } from '../transformers/clone';

let dd: typeof datadogLogs | undefined;

const DATADOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const;

type DatadogLevel = (typeof DATADOG_LEVELS)[number];

const LEVEL_MAPPINGS: Record<LogLevel, DatadogLevel> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  trace: 'debug',
  debug: 'debug',
};

/**
 * Send to Datadog in a browser environment Transport settings
 */
export interface DDTransportSettings extends Pick<Transport, 'level'> {
  /**
   * datadogLogs namespace object
   *
   * @example
   * ```ts
   * import { datadogLogs } from '@datadog/browser-logs';
   * ```
   *
   * @see https://github.com/DataDog/browser-sdk#readme
   */
  dd: typeof datadogLogs;
  /**
   * Initialization settings for datadogLogs
   *
   * @see LogsInitConfiguration
   */
  config: LogsInitConfiguration;
  /**
   * Clone transformers options
   *
   * @see CloneOptions
   */
  clone?: CloneOptions;
}

/**
 * Generate transports to send to Datadog in the browser environment
 *
 * @see https://github.com/DataDog/browser-sdk#readme
 *
 * @param settings - Send to Datadog in a browser environment Transport settings
 * @returns Log transporter
 */
export function DDTransport(settings: DDTransportSettings): Transport {
  function getDD() {
    if (dd) return dd;
    if (!dd) {
      dd = settings.dd;
      dd.init({
        site: 'datadoghq.com',
        forwardErrorsToLogs: false,
        sampleRate: 100,
        ...settings.config,
      });
    }
    return dd;
  }

  return {
    level: settings.level,
    transformers: [CloneTransformer(settings.clone)],
    transport(payload) {
      if (!settings.config.clientToken) return;

      const dd = getDD();
      const { level } = payload;
      const ddLevel = LEVEL_MAPPINGS[level];

      const _payload = { ...payload };
      const { error } = _payload;
      _payload.args = _payload.args.slice();
      delete _payload.error;
      if (error) {
        (_payload as any).error = error.instance;
        _payload.args.splice(error.index, 1);
      }
      dd.logger[ddLevel](payload.message, _payload, error?.instance);
    },
  };
}

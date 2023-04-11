import type { datadogLogs, LogsInitConfiguration } from '@datadog/browser-logs';
import { Transport, LogLevelThreshold, LogLevel } from '../schemes';
import { CloneTransformer, CloneOptions } from '../transformers/clone';

let dd: typeof datadogLogs | undefined;

const DATADOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'] as const;

type DatadogLevel = (typeof DATADOG_LEVELS)[number];

const LEVEL_MAPPINGS: Record<LogLevel, DatadogLevel> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  trace: 'debug',
  debug: 'debug',
};

export interface DDTransportSettings {
  dd: typeof datadogLogs;
  config: LogsInitConfiguration;
  level?: LogLevelThreshold;
  clone?: CloneOptions;
}

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
      dd.logger[ddLevel](payload.message, payload);
    },
  };
}

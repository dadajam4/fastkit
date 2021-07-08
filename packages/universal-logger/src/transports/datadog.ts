import type { datadogLogs, LogsUserConfiguration } from '@datadog/browser-logs';
import { Transport, LogLevelThreshold, LogLevel } from '../schemes';
import { CloneTransformer, CloneOptions } from '../transformers/clone';

let dd: typeof datadogLogs | undefined;

const DATADOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'] as const;

type DatadogLevel = typeof DATADOG_LEVELS[number];

const LEVEL_MAPPINGS: Record<LogLevel, DatadogLevel> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  trace: 'debug',
  debug: 'debug',
};

function getDD(opts: LogsUserConfiguration): typeof datadogLogs {
  if (dd) return dd;
  const { datadogLogs } = require('@datadog/browser-logs');
  datadogLogs.init({
    site: 'datadoghq.com',
    forwardErrorsToLogs: false,
    sampleRate: 100,
    ...opts,
  });
  dd = datadogLogs;
  return dd;
}

export interface DDTransportSettings {
  level?: LogLevelThreshold;
  clone?: CloneOptions;
  dd: LogsUserConfiguration;
}

export function DDTransport(settings: DDTransportSettings): Transport {
  return {
    level: settings.level,
    transformers: [CloneTransformer(settings.clone)],
    transport(payload) {
      console.log(payload);
      if (!settings.dd.clientToken) return;

      const _dd = getDD(settings.dd);
      const { level } = payload;
      const ddLevel = LEVEL_MAPPINGS[level];
      _dd.logger[ddLevel](payload.message, payload);
    },
  };
}

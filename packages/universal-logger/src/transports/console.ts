/* eslint-disable no-console */
import { consoleColorString } from '@fastkit/helpers';
import {
  Transport,
  LogLevel,
  LogLevelThreshold,
  DEFAULT_COLOR_LEVEL_MAP,
} from '../schemes';

const CONSOLE_METHODS = [
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'log',
] as const;

type ConsoleFunc = typeof CONSOLE_METHODS[number];

const LEVEL_MAPPING: Record<LogLevel, ConsoleFunc> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  trace: 'log',
};

if (typeof window !== 'undefined' && typeof console === 'undefined') {
  (window as any).console = {};
}

CONSOLE_METHODS.forEach((method) => {
  if (typeof console[method] !== 'function') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console[method] = function () {};
  }
});

export interface ConsoleTransportSettings {
  level?: LogLevelThreshold;
  pretty?: boolean;
}

export const ConsoleTransport = function (
  settings: ConsoleTransportSettings = {},
): Transport {
  return {
    level: settings.level,
    transport(payload) {
      if (typeof console === 'undefined') return;
      const { level, message, args } = payload;
      const func = LEVEL_MAPPING[level];
      let prefix = `[${level.toUpperCase()}]`;
      if (settings.pretty) {
        const color = DEFAULT_COLOR_LEVEL_MAP[payload.level];
        if (color) {
          prefix = consoleColorString(prefix, color);
        }
      }
      console[func](prefix, message, ...args);
    },
  };
};

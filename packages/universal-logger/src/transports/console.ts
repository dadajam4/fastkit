/* eslint-disable no-console */
import { consoleColorString } from '@fastkit/tiny-logger';
import {
  Transport,
  LogLevel,
  DEFAULT_COLOR_LEVEL_MAP,
  DEFAULT_LOGGER_NAME,
} from '../schemes';

const CONSOLE_METHODS = [
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'log',
] as const;

type ConsoleFunc = (typeof CONSOLE_METHODS)[number];

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
    // eslint-disable-next-line func-names
    console[method] = function () {};
  }
});

/**
 * Console transport settings
 */
export interface ConsoleTransportSettings extends Pick<Transport, 'level'> {
  /** Color decoration by log level */
  pretty?: boolean;
}

/**
 * Generate transport for output to JavaScript console
 *
 * @param settings - Console transport settings
 * @returns Log transporter
 */
export function ConsoleTransport(
  settings?: ConsoleTransportSettings,
): Transport {
  return {
    level: settings?.level,
    transport(payload) {
      if (typeof console === 'undefined') return;
      const { level, message, args, logger } = payload;
      const loggerName = logger.name;
      const func = LEVEL_MAPPING[level];
      let prefix = `[${level.toUpperCase()}]`;
      if (loggerName && loggerName !== DEFAULT_LOGGER_NAME) {
        prefix = `[${loggerName}]${prefix}`;
      }
      if (settings?.pretty) {
        const color = DEFAULT_COLOR_LEVEL_MAP[payload.level];
        if (color) {
          prefix = consoleColorString(prefix, color);
        }
      }
      const chunks = [...args];
      const firstArg = args[0];
      if (
        message !== firstArg &&
        (!(firstArg instanceof Error) || firstArg.message !== message)
      ) {
        chunks.unshift(message);
      }
      console[func](prefix, ...chunks);
    },
  };
}

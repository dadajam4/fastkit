import { ConsoleColorPaletteName } from '@fastkit/tiny-logger';

export const LOG_LEVELS = ['error', 'warn', 'info', 'trace', 'debug'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type LogLevelThreshold = 'silent' | LogLevel;

export function levelToIndex(level: LogLevel): number {
  return LOG_LEVELS.indexOf(level);
}

export function isAvailableLogLevel(
  level: LogLevel | number,
  threshold?: LogLevelThreshold | number,
) {
  if (threshold == null) return true;
  if (threshold === 'silent') return false;
  const levelIndex =
    typeof level === 'number' ? level : levelToIndex(level as LogLevel);
  const _threshold =
    typeof threshold === 'number' ? threshold : levelToIndex(threshold);

  return levelIndex <= _threshold;
}

interface Meta {
  [key: string]: any;
}

export interface LoggerPayload<M extends Meta = Meta> {
  level: LogLevel;
  logger: {
    name: string;
  };
  message: string;
  args: any[];
  meta: M;
}

export type Transformer = (payload: LoggerPayload) => LoggerPayload;

export type TransportFunc = (payload: LoggerPayload) => any | Promise<any>;

export interface Transport {
  level?: LogLevelThreshold;
  transformers?: Transformer[];
  transport: TransportFunc;
}

export type RawTransport = TransportFunc | Transport;

export function nomalizeTransport(source: RawTransport): Transport {
  return typeof source === 'function' ? { transport: source } : source;
}

export function nomalizeTransports(source?: RawTransport[]): Transport[] {
  return source ? source.map((r) => nomalizeTransport(r)) : [];
}

export interface LoggerOptions {
  level?: LogLevelThreshold;
  transformers?: Transformer[];
  transports?: RawTransport[];
}

export interface NormalizedLoggerOptions {
  level?: LogLevelThreshold;
  transformers: Transformer[];
  transports: Transport[];
}

export interface LoggerNamedSettings {
  [key: string]: LoggerOptions;
}

export interface MergedNamedSettings {
  [key: string]: NormalizedLoggerOptions;
}

export interface LoggerBuilderOptions {
  defaultSettings?: LoggerOptions;
  namedSettings?: LoggerNamedSettings;
}

function extractObjectMessage(source: any): string | undefined {
  if (
    source &&
    typeof source === 'object' &&
    typeof source.message === 'string'
  ) {
    return source.message;
  }
}

export function createPayload(
  loggerName: string,
  level: LogLevel,
  ...args: any[]
): LoggerPayload {
  let message = '';
  const { length } = args;
  const first = args[0];

  if (typeof first === 'string') {
    // >>> log('hello', 2, true, {}) のような時は一個目がメッセージで良い
    message = first;
  } else {
    const firstMessage = extractObjectMessage(first);
    if (firstMessage !== undefined) {
      // >>> log({ message: 'hello' }, 2, true, {}) のような時は一個目がメッセージで良い
      message = firstMessage;
    } else if (length === 1 && Array.isArray(first)) {
      // >>> log([{ message: 'hello' }]) のような時は一個目がメッセージで良い
      message = extractObjectMessage(first[0]) || '';
    }
  }

  if (args[0] === message) {
    args.splice(0, 1);
  }

  const payload: LoggerPayload = {
    logger: {
      name: loggerName,
    },
    level,
    message,
    args,
    meta: {},
  };
  return payload;
}

export function transformPayload(
  payload: LoggerPayload,
  transformers?: Transformer[],
) {
  transformers &&
    transformers.forEach((transformer) => {
      payload = transformer(payload);
    });
  return payload;
}

export const DEFAULT_COLOR_LEVEL_MAP: Record<
  LogLevel,
  ConsoleColorPaletteName
> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  trace: 'magenta',
  debug: 'magenta', // 'gray',
};

export const DEFAULT_LOGGER_NAME = 'default';

import {
  LogLevel,
  Transformer,
  Transport,
  createPayload,
  NormalizedLoggerOptions,
  MergedNamedSettings,
  LoggerBuilderOptions,
  transformPayload,
  nomalizeTransports,
  LoggerPayload,
  LogLevelThreshold,
  levelToIndex,
  isAvailableLogLevel,
  DEFAULT_LOGGER_NAME,
} from './schemes';

import { isPromise } from '@fastkit/helpers';

export class Logger {
  readonly name: string;
  readonly transformers: Transformer[];
  readonly transports: Transport[];

  level: LogLevelThreshold;

  constructor(name: string, opts: NormalizedLoggerOptions) {
    this.name = name;
    this.transformers = opts.transformers;
    this.transports = opts.transports;
    this.level = opts.level || 'trace';
  }

  log(level: LogLevel, ...args: any[]) {
    let payload = createPayload(this.name, level, ...args);
    const logLevelIndex = levelToIndex(payload.level);

    try {
      payload = transformPayload(payload, this.transformers);
    } catch (err) {
      return Promise.reject(err);
    }

    const results = this.transports.map(
      ({ level, transformers, transport }) => {
        if (level == null) level = this.level;
        if (!isAvailableLogLevel(logLevelIndex, level))
          return Promise.resolve();

        try {
          payload = transformPayload(payload, transformers);
          const result = transport(payload);
          return isPromise(result) ? result : Promise.resolve(result);
        } catch (err) {
          return Promise.reject(err);
        }
      },
    );

    return results;
  }

  trace(...args: any[]) {
    return this.log('trace', ...args);
  }

  debug(...args: any[]) {
    return this.log('debug', ...args);
  }

  info(...args: any[]) {
    return this.log('info', ...args);
  }

  warn(...args: any[]) {
    return this.log('warn', ...args);
  }

  error(...args: any[]) {
    return this.log('error', ...args);
  }
}

export function combineFormater(...transformers: Transformer[]): Transformer {
  if (transformers.length === 1) return transformers[0];
  return function combinedFormater(payload: LoggerPayload) {
    transformers.forEach((transformer) => {
      payload = transformer(payload);
    });
    return payload;
  };
}

export function loggerBuilder(opts: LoggerBuilderOptions = {}): {
  getLogger: (name?: string) => Logger;
  getNamedSettings: (name: string) => NormalizedLoggerOptions;
  Logger: typeof Logger;
} {
  const { defaultSettings = {}, namedSettings = {} } = opts;
  const mergedNamedSettings = {} as MergedNamedSettings;
  const caches: {
    [key: string]: Logger;
  } = {};

  const {
    level: defaultLevelThreshold = 'trace',
    transformers: defaultTransformers = [],
  } = defaultSettings;

  const defaultTransports = nomalizeTransports(defaultSettings.transports);

  Object.keys(namedSettings).forEach((name) => {
    const {
      level = defaultLevelThreshold,
      transformers = [],
      transports = [],
    } = namedSettings[name];
    const merged: NormalizedLoggerOptions = {
      level,
      transformers: [...defaultTransformers, ...transformers],
      transports: [...defaultTransports, ...nomalizeTransports(transports)],
    };
    mergedNamedSettings[name] = merged;
  });

  function getNamedSettings(name: string): NormalizedLoggerOptions {
    const settings = mergedNamedSettings[name];
    return (
      settings || {
        level: defaultLevelThreshold,
        transformers: defaultTransformers,
        transports: defaultTransports,
      }
    );
  }

  class BuildedLogger extends Logger {
    constructor(name: string) {
      super(name, getNamedSettings(name));
    }
  }

  function getLogger(name: string = DEFAULT_LOGGER_NAME): BuildedLogger {
    const cache = caches[name];
    if (cache) return cache as BuildedLogger;
    const logger = new BuildedLogger(name);
    caches[name] = logger;
    return logger;
  }

  return { getLogger, getNamedSettings, Logger: BuildedLogger };
}

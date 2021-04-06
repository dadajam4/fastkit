const TINY_LOGGER_LOG_TYPES = ['debug', 'info', 'warn', 'error'] as const;

export type TinyLoggerLogType = typeof TINY_LOGGER_LOG_TYPES[number];

export interface TinyLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export class TinyLogger {
  private _name: string;

  get name() {
    return this._name;
  }

  constructor(loggerName: string) {
    this._name = loggerName;
  }

  log(type: TinyLoggerLogType, message: string, ...args: any[]) {
    console[type](`[${this.name}] ${message}`, ...args);
  }
}

TINY_LOGGER_LOG_TYPES.forEach((type) => {
  TinyLogger.prototype[type] = function (message, ...args) {
    this.log(type, message, ...args);
  };
});

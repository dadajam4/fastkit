import { ConsoleColorPaletteName, consoleColorString } from './console-color';

const TINY_LOGGER_LOG_TYPES = [
  'debug',
  'info',
  'warn',
  'error',
  'success',
] as const;

export type TinyLoggerLogType = (typeof TINY_LOGGER_LOG_TYPES)[number];

export const COLOR_MAP: {
  [K in TinyLoggerLogType]?: ConsoleColorPaletteName;
} = {
  debug: 'magenta',
  info: 'cyan',
  warn: 'yellow',
  error: 'red',
  success: 'green',
};

export interface TinyLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
}

let colorEnable = true;

export class TinyLogger {
  private _name: string;

  static colorEnable(enable: true) {
    colorEnable = enable;
  }

  get name() {
    return this._name;
  }

  constructor(loggerName: string) {
    this._name = loggerName;
  }

  log(type: TinyLoggerLogType, message: string, ...args: any[]) {
    const color = colorEnable && COLOR_MAP[type];
    message = `[${this.name}] ${message}`;
    const body = color ? consoleColorString(message, color) : message;
    const fn = type === 'success' ? 'log' : type;
    console[fn](body, ...args);
  }
}

TINY_LOGGER_LOG_TYPES.forEach((type) => {
  TinyLogger.prototype[type] = function (message, ...args) {
    this.log(type, message, ...args);
  };
});

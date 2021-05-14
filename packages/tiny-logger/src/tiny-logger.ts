const TINY_LOGGER_LOG_TYPES = [
  'debug',
  'info',
  'warn',
  'error',
  'success',
] as const;

export type TinyLoggerLogType = typeof TINY_LOGGER_LOG_TYPES[number];

const PALETTE = {
  reset: '\u001b[0m',
  // black: '\u001b[30m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  // blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  // white: '\u001b[37m'
};

export const COLOR_MAP: {
  [K in TinyLoggerLogType]?: string;
} = {
  debug: PALETTE.magenta,
  info: PALETTE.cyan,
  warn: PALETTE.yellow,
  error: PALETTE.red,
  success: PALETTE.green,
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
    const colorOpenTag = (colorEnable && COLOR_MAP[type]) || '';
    const colorCloseTag = colorOpenTag ? PALETTE.reset : '';
    const fn = type === 'success' ? 'log' : type;
    console[fn](
      `${colorOpenTag}[${this.name}] ${message}${colorCloseTag}`,
      ...args,
    );
  }
}

TINY_LOGGER_LOG_TYPES.forEach((type) => {
  TinyLogger.prototype[type] = function (message, ...args) {
    this.log(type, message, ...args);
  };
});

const name = 'VuePageControlError';

export interface VuePageControlErrorSettings {
  statusCode?: number;
  message?: string;
  stack?: string;
}

export function isVuePageControlError(
  source: unknown,
): source is VuePageControlError {
  return source instanceof VuePageControlError;
}

export class VuePageControlError extends Error {
  readonly name = name;
  readonly statusCode: number;

  constructor(
    rawSettings: VuePageControlErrorSettings | unknown | string | Error = {},
  ) {
    let settings: VuePageControlErrorSettings;
    if (rawSettings instanceof Error) {
      if (isVuePageControlError(rawSettings)) {
        settings = {
          statusCode: rawSettings.statusCode,
          message: rawSettings.message,
          stack: rawSettings.stack,
        };
      } else {
        settings = {
          message: rawSettings.message,
          stack: rawSettings.stack,
        };
      }
    } else {
      settings =
        typeof rawSettings === 'string'
          ? { message: rawSettings }
          : rawSettings && typeof rawSettings === 'object'
          ? {
              statusCode: (rawSettings as VuePageControlErrorSettings)
                .statusCode,
              message: (rawSettings as VuePageControlErrorSettings).message,
              stack: (rawSettings as VuePageControlErrorSettings).stack,
            }
          : {};
    }

    const {
      statusCode = 500,
      message = 'An error has occurred.',
      stack,
    } = settings;
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    }
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      stack: this.stack,
    };
  }
}

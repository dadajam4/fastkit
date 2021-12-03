import {
  loggerBuilder,
  Transport,
  ConsoleTransport,
} from '@fastkit/universal-logger';

const transports: Transport[] = [
  ConsoleTransport({
    level: import.meta.env.DEV ? 'debug' : 'info',
    pretty: true,
  }),
];

export const { getLogger, getNamedSettings, Logger } = loggerBuilder({
  defaultSettings: {
    level: import.meta.env.DEV ? 'debug' : 'trace',
    transports,
  },
});

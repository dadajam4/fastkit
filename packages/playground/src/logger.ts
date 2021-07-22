import {
  loggerBuilder,
  Transport,
  ConsoleTransport,
  STDOTransport,
  // DDTransport,
} from '@fastkit/universal-logger';
// import { datadogLogs } from '@datadog/browser-logs';

const transports: Transport[] = [];

if (!import.meta.env.SSR) {
  transports.push(
    ConsoleTransport({
      level: import.meta.env.DEV ? 'debug' : 'info',
      pretty: true,
    }),
    // DDTransport({
    //   dd: datadogLogs,
    //   level: 'info',
    //   config: {
    //     clientToken: 'xxxxxxxxxx',
    //     env: 'development',
    //     service: 'fastkit',
    //   },
    // }),
  );
} else {
  transports.push(
    STDOTransport({
      level: import.meta.env.DEV ? 'info' : 'info',
      pretty: import.meta.env.DEV,
    }),
  );
}

export const { getLogger, getNamedSettings, Logger } = loggerBuilder({
  defaultSettings: {
    level: import.meta.env.DEV ? 'debug' : 'trace',
    transports,
  },
});

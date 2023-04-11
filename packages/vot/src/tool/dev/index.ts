import { createSsrServer, CreateSsrServerOptions } from './server';

export * from './server';

export const startServer = (options?: CreateSsrServerOptions) =>
  createSsrServer(options).then((server) => server.listen());

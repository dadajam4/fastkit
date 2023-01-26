import type { ServerResponse } from 'node:http';
import type { IncomingMessage } from 'connect';
import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { WriteResponseFn, RedirectFn } from './renderer';
import type { VotPlugin } from './plugin';
import type { VotHooks } from './hooks';

export interface VotContext {
  url: URL | Location;
  request?: IncomingMessage;
  response?: ServerResponse;
  isClient: boolean;
  redirect: RedirectFn;
  writeResponse: WriteResponseFn;
  initialState: Record<string, any>;
  app: App;
  router: Router;
  initialRoute: ReturnType<Router['resolve']>;
  plugins: VotPlugin[];
  hooks: VotHooks;
  teleports?: Record<string, string>;
}

import type { ServerResponse } from 'http';
import type { IncomingMessage } from 'connect';
import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { WriteResponseFn, RedirectFn } from './renderer';

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
}

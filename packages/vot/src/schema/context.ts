import type { ServerResponse } from 'node:http';
import type { IncomingMessage } from 'connect';
import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { VuePageServerContext } from '@fastkit/vue-page';
import type { WriteResponseFn, RedirectFn } from './renderer';
import type { VotPlugin } from './plugin';
import type { VotHooks } from './hooks';

/**
 * What this adapter puts in {@link VuePageServerContext.runtime}.
 *
 * The page layer never looks inside it; it is here so that vot's own code —
 * page middleware, above all — can still reach the Node objects it is running
 * on without the page layer having to know they exist.
 */
export interface VotNodeRuntime {
  request: IncomingMessage;
  response: ServerResponse;
}

export interface VotContext {
  url: URL | Location;
  request?: IncomingMessage;
  response?: ServerResponse;
  /**
   * Assembled here and handed to the page layer, which never builds one.
   * Absent in the browser.
   */
  server?: VuePageServerContext;
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

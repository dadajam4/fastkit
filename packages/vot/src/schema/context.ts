import type { App } from 'vue';
import type { Router } from 'vue-router';
import type {
  PageResponseDraft,
  VuePageServerContext,
} from '@fastkit/vue-page';
import type { WriteResponseFn, RedirectFn } from './renderer';
import type { VotRuntimeContext } from './adapter';
import type { VotPlugin } from './plugin';
import type { VotHooks } from './hooks';

export interface VotContext {
  url: URL | Location;
  /**
   * The incoming request, absent in the browser.
   *
   * A web-standard `Request`: nothing here is tied to `node:http` any more, so
   * the render core runs wherever its adapter does.
   */
  request?: Request;
  /**
   * Where the status and headers for this render are written, absent in the
   * browser.
   */
  response?: PageResponseDraft;
  /**
   * A handle on the transport this request arrived over.
   *
   * The core never looks inside it; see {@link VotRuntimeContext}.
   */
  runtime?: VotRuntimeContext;
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

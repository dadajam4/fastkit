import type { Component } from 'vue';
import type { VuePageControlMiddlewareFn } from '@fastkit/vue-page';
import type { VueHeadClient } from '@unhead/vue';
import type {
  RouteLocationRaw,
  RouterOptions,
  RouteRecordRaw,
  useLink,
} from 'vue-router';
import type { InlineConfig } from 'vite';
import type vueJsx from '@vitejs/plugin-vue-jsx';
import type { UserOptions as PagesUserOptions } from 'vite-plugin-pages';
import type { Options as VuePluginOptions } from '@vitejs/plugin-vue';
import type { RawVotPlugin } from './plugin';
import type { VotContext } from './context';
import type { WrittenResponse } from './renderer';
import type { VotRuntimeContext } from './adapter';
import type { RawVotGenerateOptions } from './generate';

type VueJsxOptions = Parameters<typeof vueJsx>[0];

/**
 * What `configureServer` is handed.
 *
 * `app` is the adapter's own application object -- a `Hono` instance under the
 * default adapter. vot deliberately does not invent a middleware abstraction
 * of its own to sit in front of it: one more layer to learn, and one more place
 * for `vot dev` and `vot serve` to disagree.
 */
export interface VotConfigureServerContext<App = unknown> {
  app: App;
}

export type VotConfigureServerFn<App = unknown> = (
  ctx: VotConfigureServerContext<App>,
) => (() => void) | void | Promise<(() => void) | void>;

export interface BuildOptions {
  /**
   * Vite options applied only to the client build
   */
  clientOptions?: InlineConfig;
  /**
   * Vite options applied only to the server build
   */
  serverOptions?: InlineConfig & {
    /**
     * Extra properties to include in the generated server package.json,
     * or 'false' to avoid generating it.
     */
    packageJson?: Record<string, unknown> | false;
  };
}

export interface SsrOptions {
  plugin?: string;
  ssrEntry?: string;
  getRenderContext?: (params: {
    url: string;
    request: Request;
    runtime?: VotRuntimeContext;
    resolvedEntryPoint: Record<string, any>;
  }) => Promise<WrittenResponse>;
}

type Awaitable<T> = T | PromiseLike<T>;

export type VotRoutesGenerated = (
  routes: RouteRecordRaw[],
) => Awaitable<RouteRecordRaw[] | void>;

export interface VotServerEntryOptions {
  /**
   * Path to the server entry, relative to the project root.
   *
   * Defaults to `vot.server.{ts,mts,js,mjs}` at the project root when such a
   * file exists. An explicit path that does not exist is an error.
   *
   * The entry owns `host` / `port` / `proxy` and the server middleware for both
   * `vot dev` and `vot serve`, and `vot build` bundles it into `dist/server`.
   * That is what lets `vot serve` run without evaluating `vite.config.ts`, so a
   * production image needs no build-time plugin installed.
   */
  entry?: string;
}

export interface VotPluginPagesOptions extends PagesUserOptions {
  onRoutesGenerated?: VotRoutesGenerated;
}

export interface VotPluginOptions extends SsrOptions {
  /**
   * Path to entry index.html
   * @default '<root>/index.html'
   */
  input?: string;
  /**
   * ID of the app container in index.html. Defaults to "app".
   */
  containerId?: string;
  build?: BuildOptions & {
    /**
     * Keep the index.html generated in the client build
     * @default false
     */
    keepIndexHtml?: boolean;
  };
  excludeSsrComponents?: Array<RegExp>;
  vue?: VuePluginOptions;
  jsx?: VueJsxOptions;
  pages?: VotPluginPagesOptions;
  /**
   * Prefer declaring this in the server entry -- see
   * {@link VotServerEntryOptions}. Defining it in both places runs both, in
   * this order, and warns.
   */
  configureServer?: VotConfigureServerFn<any>;
  /**
   * Server entry configuration.
   */
  server?: VotServerEntryOptions;

  /**
   * Options for Static Site Generation
   */
  generate?: RawVotGenerateOptions;
}

// export function getPluginOptions(viteConfig: ResolvedConfig) {
//   return ((
//     viteConfig.plugins.find((plugin) => plugin.name === 'vite:vot') as any
//   )?.votOptions || {}) as VotPluginOptions;
// }

export interface Meta {
  // propsGetter?: boolean | string;
  state?: Record<string, any> | null;
  [key: string]: any;
}

// export interface Base {
//   (params: { url: Location | URL }): string;
// }

export type ExtendedRouteRaw = RouteLocationRaw & {
  props?: any;
  meta?: Meta;
};

export interface VotRouterOptions extends Omit<
  RouterOptions,
  'routes' | 'history'
> {
  RouterLink?: any;
  useLink?: typeof useLink;
}

export interface CreateEntryOptions {
  // base?: Base;
  debug?: { mount?: boolean };
  transformState?: (
    state: any,
    defaultTransformer: (state: any) => any,
  ) => any | Promise<any>;
  routes?: ExtendedRouteRaw[];
  routerOptions?: VotRouterOptions;
  plugins?: RawVotPlugin[];
  middleware?: VuePageControlMiddlewareFn[];
  ErrorComponent?: Component;
}

export interface Hook {
  (params: VotContext): HookResponse | Promise<HookResponse>;
}

export type HookResponse = void | {
  head?: VueHeadClient<any>;
};

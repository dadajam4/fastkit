import type { Component } from 'vue';
import type { VuePageControlMiddlewareFn } from '@fastkit/vue-page';
import type { HeadClient } from '@vueuse/head';
import type { RouteLocationRaw, RouterOptions } from 'vue-router';
import type { VotContext } from './context';
import type { RawVotPlugin } from './plugin';
import type { InlineConfig } from 'vite';
import type vueJsx from '@vitejs/plugin-vue-jsx';
import type { UserOptions as PagesUserOptions } from 'vite-plugin-pages';
import type { Options as VuePluginOptions } from '@vitejs/plugin-vue';
import type { Server, IncomingMessage } from 'connect';
import type { ServerResponse } from 'http';
import type { WrittenResponse } from './renderer';
import type { RawVotGenerateOptions } from './generate';

type VueJsxOptions = Parameters<typeof vueJsx>[0];

export interface VotConfigureServerContext {
  use: Server['use'];
}

export type VotConfigureServerFn = (
  ctx: VotConfigureServerContext,
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
  ssr?: string;
  getRenderContext?: (params: {
    url: string;
    request: IncomingMessage;
    response: ServerResponse;
    resolvedEntryPoint: Record<string, any>;
  }) => Promise<WrittenResponse>;
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
  pages?: PagesUserOptions;
  configureServer?: VotConfigureServerFn;

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

export interface CreateEntryOptions {
  // base?: Base;
  debug?: { mount?: boolean };
  transformState?: (
    state: any,
    defaultTransformer: (state: any) => any,
  ) => any | Promise<any>;
  routes?: ExtendedRouteRaw[];
  routerOptions?: Omit<RouterOptions, 'routes' | 'history'>;
  plugins?: RawVotPlugin[];
  middleware?: VuePageControlMiddlewareFn[];
  ErrorComponent?: Component;
}

export interface Hook {
  (params: VotContext): HookResponse | Promise<HookResponse>;
}

export type HookResponse = void | {
  head?: HeadClient;
};

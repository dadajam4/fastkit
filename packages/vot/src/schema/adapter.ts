import type { Logger } from 'vite';
import type { ResolvedVotProxyRule } from './proxy';

/**
 * A handle on the transport a request actually arrived over.
 *
 * The render core never looks inside it. It is here so that code which does
 * need the native objects -- an adapter's own middleware, or an application
 * that knowingly targets one runtime -- can reach them without the core having
 * to know they exist. Each adapter documents its own accessor;
 * `@fastkit/vot/adapters/node` exports `getNodeRuntime()`.
 */
export interface VotRuntimeContext {
  /** Name of the adapter that produced this request. */
  adapter: string;
  /** Whatever that adapter chose to expose. */
  native?: unknown;
}

/**
 * The render core, as everything downstream sees it.
 *
 * Returning `undefined` declines the request: the adapter passes it on rather
 * than answering. The catch-all uses this for the requests it deliberately
 * does not own -- a non-GET, `/favicon.ico` -- so that they reach whatever sits
 * behind vot instead of becoming a 404 it invented.
 */
export type VotRequestHandler = (
  request: Request,
  runtime?: VotRuntimeContext,
) => Promise<Response | undefined>;

/** What an adapter reports after it has started listening. */
export interface VotListenResult {
  host: string;
  port: number;
  close(): Promise<void>;
  /** The native server, for callers that knowingly target one runtime. */
  native?: unknown;
}

/**
 * Everything an adapter needs in order to build an application.
 *
 * The mount order this describes is not negotiable, because it is the order
 * `vot dev` produces and the two must agree: **proxy, then user middleware,
 * then static assets, then the catch-all**. Proxy rules and user middleware sit
 * at the server root, outside `base`; static assets and the catch-all live
 * under it.
 */
export interface VotAdapterContext<App = unknown> {
  /** Which command is building this server. */
  command: 'dev' | 'serve';
  host: string;
  port: number;
  /** Always begins and ends with `/`. */
  base: string;
  proxy: ResolvedVotProxyRule[];
  logger: Pick<Logger, 'error'>;
  /**
   * Static assets to serve under `base`. Absent under `vot dev`, where Vite
   * serves them itself.
   */
  static?: {
    /** Absolute path to the directory holding the built client. */
    dir: string;
    /** Asset paths relative to {@link VotAdapterContext.static.dir}. */
    assets: string[];
  };
  /** The catch-all. */
  handler: VotRequestHandler;
  /** User middleware, given the adapter's own application object. */
  configureServer?: (ctx: { app: App }) => void | Promise<void>;
}

/**
 * An application an adapter has built.
 */
export interface VotAdapterApp<App = unknown> {
  /** What `configureServer({ app })` was handed. */
  app: App;
  /**
   * The application as a fetch handler.
   *
   * This is the export target for runtimes that take one -- Workers, Deno,
   * Bun -- and it is what {@link VotAdapterApp.listen} serves.
   */
  fetch(request: Request): Promise<Response>;
  /**
   * Start listening, for runtimes that have a server to start.
   *
   * Absent on adapters whose runtime owns the listening socket.
   */
  listen?(): Promise<VotListenResult>;
}

/**
 * What an adapter can and cannot do.
 *
 * Declared rather than discovered, so that vot can say at startup that a
 * configured rule will not be honoured. A capability that is silently absent is
 * the failure this replaces (#236).
 */
export interface VotAdapterSupports {
  /**
   * Forwards WebSocket upgrades for proxy rules that ask for them.
   *
   * The fetch model has no notion of an upgrade, so this is necessarily a
   * per-runtime answer rather than something the core can provide.
   *
   * @default false
   */
  proxyWebSocket?: boolean;
  /**
   * Provides {@link VotAdapterApp.listen}.
   *
   * @default false
   */
  listen?: boolean;
}

/**
 * A server runtime vot can run on.
 *
 * The render core does not depend on any adapter, and no adapter's
 * runtime-specific modules may be reachable from it -- `@hono/node-server`
 * names `node:http`, and a build for a runtime without it fails the moment that
 * import becomes reachable.
 */
export interface VotServerAdapter<App = unknown> {
  name: string;
  supports?: VotAdapterSupports;
  createApp(ctx: VotAdapterContext<App>): Promise<VotAdapterApp<App>>;
}

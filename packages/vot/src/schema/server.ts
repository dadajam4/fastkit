import type { Hono } from 'hono';
import type { VotProxyConfig } from './proxy';
import type { VotConfigureServerFn } from './options';

/**
 * Command that is evaluating the server entry.
 *
 * `build` and `generate` are absent on purpose: the entry is bundled, not
 * evaluated, at build time. Evaluating it there would read environment
 * variables that only exist on the machine that finally runs the app.
 */
export type VotServerCommand = 'dev' | 'serve';

export interface VotServerContext {
  /**
   * Command that is evaluating this entry.
   */
  command: VotServerCommand;
  /**
   * `true` while the Vite development server is running (`command === 'dev'`).
   */
  dev: boolean;
  /**
   * Vite mode (`development`, `production`, ...).
   */
  mode: string;
}

/**
 * The server-side runtime surface of a vot application.
 *
 * Everything here is read by both `vot dev` and `vot serve`, so the two can
 * never drift apart.
 */
export interface VotServerConfig<App = Hono> {
  /**
   * Hostname the server listens on.
   * @default '0.0.0.0' (`vot serve`)
   */
  host?: string | boolean;
  /**
   * Port the server listens on.
   * @default 3000
   */
  port?: number;
  /**
   * Proxy rules.
   *
   * Matched at the server root, outside `base`. See {@link VotProxyOptions}
   * for what a rule may carry -- it is narrower than Vite's `server.proxy`,
   * because forwarding is done over `fetch`.
   */
  proxy?: VotProxyConfig;
  /**
   * Mount extra middleware on the server.
   *
   * The callback receives the adapter's own application object, a `Hono`
   * instance by default. Middleware is mounted at the server root, outside
   * `base`, so a path such as `/healthcheck` answers at the same URL under
   * `vot dev` and `vot serve`.
   */
  configureServer?: VotConfigureServerFn<App>;
}

/**
 * A server entry's default export.
 *
 * The function form is evaluated at startup, so it can read `process.env` of
 * the machine that runs the app rather than the one that built it.
 */
export type VotServerDefinition<App = Hono> =
  | VotServerConfig<App>
  | ((
      ctx: VotServerContext,
    ) => VotServerConfig<App> | Promise<VotServerConfig<App>>);

/**
 * Define the server-side runtime surface of a vot application.
 *
 * Place the result as the default export of the server entry (`vot.server.ts`
 * at the project root, or the file given to `votPlugin({ server: { entry } })`).
 *
 * @example
 * ```ts
 * // vot.server.ts
 * import { defineVotServer } from '@fastkit/vot/server';
 *
 * export default defineVotServer(({ dev }) => ({
 *   host: '0.0.0.0',
 *   port: dev ? 3000 : Number(process.env.PORT ?? 8080),
 *   configureServer({ app }) {
 *     app.get('/healthcheck', (c) => c.body(null, 200));
 *   },
 * }));
 * ```
 *
 * `app` is typed by the adapter in use. It defaults to `Hono`; an application
 * on another adapter names that adapter's type -- `defineVotServer<MyApp>(...)`.
 */
export function defineVotServer<App = Hono>(
  definition: VotServerDefinition<App>,
): VotServerDefinition<App> {
  return definition;
}

/**
 * Evaluate a server entry's default export for the given context.
 */
export async function resolveVotServerDefinition<App = Hono>(
  definition: VotServerDefinition<App>,
  ctx: VotServerContext,
): Promise<VotServerConfig<App>> {
  return typeof definition === 'function' ? definition(ctx) : definition;
}

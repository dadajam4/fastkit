import type { ProxyOptions } from 'vite';
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
export interface VotServerConfig {
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
   * Proxy rules, in the same shape as Vite's `server.proxy`.
   */
  proxy?: Record<string, string | ProxyOptions>;
  /**
   * Mount extra middleware on the server.
   */
  configureServer?: VotConfigureServerFn;
}

/**
 * A server entry's default export.
 *
 * The function form is evaluated at startup, so it can read `process.env` of
 * the machine that runs the app rather than the one that built it.
 */
export type VotServerDefinition =
  | VotServerConfig
  | ((ctx: VotServerContext) => VotServerConfig | Promise<VotServerConfig>);

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
 *   configureServer({ use }) {
 *     use('/healthcheck', (_req, res) => res.writeHead(200).end());
 *   },
 * }));
 * ```
 */
export function defineVotServer<T extends VotServerDefinition>(
  definition: T,
): T {
  return definition;
}

/**
 * Evaluate a server entry's default export for the given context.
 */
export async function resolveVotServerDefinition(
  definition: VotServerDefinition,
  ctx: VotServerContext,
): Promise<VotServerConfig> {
  return typeof definition === 'function' ? definition(ctx) : definition;
}

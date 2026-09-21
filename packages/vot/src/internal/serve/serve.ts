/* eslint-disable no-console */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import module from 'node:module';
import type { Hono } from 'hono';
import type { Server } from 'node:http';
import type { Logger, ResolvedServerUrls } from 'vite';
import chalk from 'chalk';
import { capitalize } from '@fastkit/helpers';
import { resolveServerUrls } from '../../utils/host';
import {
  resolveVotServerDefinition,
  VotServerDefinition,
} from '../../schema/server';
import {
  resolveProxyConfig,
  ResolvedVotProxyRule,
  VotProxyConfig,
} from '../../schema/proxy';
import {
  DEFAULT_SHUTDOWN_TIMEOUT,
  type VotAdapterContext,
  type VotListenResult,
  type VotServerAdapter,
} from '../../schema/adapter';
import type { VotConfigureServerFn } from '../../schema/options';
import { createVotRequestHandler } from './handler';

const require = module.createRequire(import.meta.url);

export interface ServeOptions {
  /**
   * Run on something other than Node.
   *
   * Left unset, `vot serve` loads `@fastkit/vot/adapters/node`. That import is
   * deliberately lazy: it names `node:http`, and reaching it from the core
   * would break a build for any runtime without it.
   */
  adapter?: VotServerAdapter<any>;
}

export interface ServedResult extends VotListenResult {
  resolvedUrls: ResolvedServerUrls;
}

/**
 * Everything `serve()` needs, regardless of where it came from.
 *
 * The server entry emitted by `vot build` fills this in directly. Without one,
 * it is reconstructed from the project's Vite config -- see
 * {@link loadConfigFromViteConfig}.
 */
interface ResolvedServeConfig {
  host: string;
  port: number;
  base?: string;
  proxy?: VotProxyConfig;
  logger: Pick<Logger, 'error'>;
  configureServer?: VotConfigureServerFn<any>;
  shutdownTimeout?: number;
}

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 3000;

/**
 * Minimal stand-in for Vite's logger.
 *
 * Only `error` is ever called (by the proxy), and building one here is what
 * keeps `resolveConfig()` out of the serve path.
 */
const consoleLogger: Pick<Logger, 'error'> = {
  error(msg) {
    console.error(msg);
  },
};

function importDist(file: string): Promise<any> {
  return import(pathToFileURL(file).href);
}

function resolveHost(host: string | boolean | undefined): string {
  return host && host !== true ? host : DEFAULT_HOST;
}

function normalizeBase(base: string | undefined): string {
  if (!base || base === '/') return '/';
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * Read the server entry that `vot build` bundled into `dist/server`.
 *
 * Nothing here touches the project's Vite config, so the production runtime
 * does not need any of the plugins that `vite.config.ts` imports.
 */
async function loadConfigFromServerEntry(
  serverDist: string,
  entry: string,
  base: string | undefined,
): Promise<ResolvedServeConfig> {
  const mod = await importDist(path.join(serverDist, entry));
  const definition: VotServerDefinition<any> | undefined = mod.default;

  if (!definition) {
    throw new Error(
      `the server entry "${entry}" has no default export. Export the result of \`defineVotServer()\`.`,
    );
  }

  const config = await resolveVotServerDefinition(definition, {
    command: 'serve',
    dev: false,
    mode: process.env.NODE_ENV || 'production',
  });

  return {
    host: resolveHost(config.host),
    port: config.port || DEFAULT_PORT,
    base,
    proxy: config.proxy,
    logger: consoleLogger,
    configureServer: config.configureServer,
    shutdownTimeout: config.shutdownTimeout,
  };
}

/**
 * Reconstruct the serve config by evaluating the project's `vite.config.ts`.
 *
 * Kept for applications built before server entries existed. It is the reason
 * every plugin referenced by `vite.config.ts` has to be installed in
 * production, so `vite` is imported lazily and only down this path.
 */
async function loadConfigFromViteConfig(): Promise<ResolvedServeConfig> {
  const { loadConfigFromFile } = await import('vite');

  // Tells the vot plugin's `config()` hook that this is a production serve
  // rather than `vot dev`.
  process.env.__VOT_SERVE = 'true';

  const loadedConfig = await loadConfigFromFile({ command: 'serve' } as any);

  if (!loadedConfig) {
    throw new Error(`missing vite config.`);
  }

  const { config } = loadedConfig;

  return {
    host: resolveHost(config.server?.host),
    port: config.server?.port || DEFAULT_PORT,
    base: config.base,
    proxy: config.server?.proxy as VotProxyConfig | undefined,
    logger: consoleLogger,
  };
}

export async function serve(opts: ServeOptions = {}): Promise<ServedResult> {
  const dist = path.resolve(process.cwd(), 'dist');
  const serverDist = path.join(dist, 'server');

  const { ssr, exports, base: builtBase, server: serverEntry } = require(
    path.join(serverDist, 'package.json'),
  );

  const usingServerEntry = !!serverEntry?.entry;
  const config: ResolvedServeConfig = usingServerEntry
    ? await loadConfigFromServerEntry(serverDist, serverEntry.entry, builtBase)
    : await loadConfigFromViteConfig();

  if (!usingServerEntry) {
    console.warn(
      chalk.yellow(
        `[vot] serving without a server entry. \`configureServer\` from vite.config.ts is not applied here -- move it to a server entry (\`vot.server.ts\`) so that the same middleware answers under \`vot dev\` and \`vot serve\`.`,
      ),
    );
  }

  const { host, port, logger } = config;
  const base = normalizeBase(config.base);

  const manifest = require(path.join(dist, 'client/.vite/ssr-manifest.json'));
  const { default: render } = await importDist(path.join(serverDist, exports));

  const rules: ResolvedVotProxyRule[] = config.proxy
    ? resolveProxyConfig(config.proxy)
    : [];

  const adapter =
    opts.adapter ?? (await import('../../adapters/node')).nodeAdapter;

  const handler = createVotRequestHandler({
    render,
    manifest,
    preload: true,
    base,
  });

  const adapterContext: VotAdapterContext<Hono> = {
    command: 'serve',
    host,
    port,
    base,
    proxy: rules,
    logger,
    shutdownTimeout: config.shutdownTimeout ?? DEFAULT_SHUTDOWN_TIMEOUT,
    static: { dir: path.join(dist, 'client'), assets: ssr.assets || [] },
    handler,
    configureServer: config.configureServer
      ? (ctx) => config.configureServer?.(ctx) as void | Promise<void>
      : undefined,
  };

  const app = await adapter.createApp(adapterContext);

  if (!app.listen) {
    throw new Error(
      `the "${adapter.name}" adapter has no \`listen()\`. Export \`app.fetch\` to its runtime instead of calling \`vot serve\`.`,
    );
  }

  const listened = await app.listen();

  /**
   * The URL banner reads the listening socket, which only an adapter that has
   * one can provide. An adapter without a native server still serves -- it just
   * has no addresses to print.
   */
  const native = listened.native as Server | undefined;
  const resolvedUrls: ResolvedServerUrls = native?.address
    ? await resolveServerUrls(
        native,
        { host: config.host },
        { rawBase: config.base },
      )
    : { local: [], network: [] };

  console.log('');
  console.log(chalk.green('vot server running at:'));
  console.log('');

  (['local', 'network'] as const).forEach((type) => {
    const urls = resolvedUrls[type];
    const urlsText = urls.length
      ? chalk.cyan(urls.join(' '))
      : chalk.gray('Not exposed.');
    console.log(`> ${capitalize(type)}: ${urlsText}`);
  });

  return { ...listened, resolvedUrls };
}

/* eslint-disable no-console */
import { proxy } from 'hono/proxy';
import type { MiddlewareHandler } from 'hono';
import chalk from 'chalk';
import type { Logger } from 'vite';
import {
  ResolvedVotProxyRule,
  matchProxyRule,
  ruleForwardsWebSocket,
} from '../../schema/proxy';

export interface ProxyMiddlewareConfig {
  rules: ResolvedVotProxyRule[];
  logger: Pick<Logger, 'error'>;
}

/**
 * Resolve where a request goes once a rule has claimed it.
 *
 * The target's own path is a prefix, so a rule pointing at
 * `http://upstream/v1` sends `/api/items` to `/v1/api/items` -- the behaviour
 * `http-proxy` had. A `ws:` target is normalized to `http:` here; forwarding an
 * upgrade is the adapter's job, and what reaches this function is the plain
 * HTTP half of such a rule.
 */
export function resolveProxyTarget(
  rule: ResolvedVotProxyRule,
  requestUrl: string,
): URL {
  const source = new URL(requestUrl);
  const pathWithQuery = `${source.pathname}${source.search}`;
  const forwarded = rule.rewrite ? rule.rewrite(pathWithQuery) : pathWithQuery;

  const target = new URL(rule.target.replace(/^ws/, 'http'));
  const prefix = target.pathname.replace(/\/$/, '');
  const [pathname, search = ''] = splitOnce(forwarded, '?');

  const destination = new URL(target);
  destination.pathname = `${prefix}${pathname}`;
  destination.search = search;
  return destination;
}

function splitOnce(value: string, separator: string): [string, string?] {
  const index = value.indexOf(separator);
  return index === -1
    ? [value]
    : [value.slice(0, index), value.slice(index + 1)];
}

/**
 * Forward matching requests upstream, and decline everything else.
 *
 * Mounted at the server root, outside `base`: a proxy rule is not part of the
 * application's asset tree, and the same rule has to answer at the same URL
 * under `vot dev` and `vot serve`.
 */
export function proxyMiddleware(
  config: ProxyMiddlewareConfig,
): MiddlewareHandler {
  const { rules, logger } = config;

  return async function votProxyMiddleware(c, next) {
    const { pathname, search } = new URL(c.req.url);
    const rule = matchProxyRule(rules, `${pathname}${search}`);
    if (!rule) return next();

    const destination = resolveProxyTarget(rule, c.req.url);
    const headers: Record<string, string | undefined> = {
      ...c.req.header(),
      ...rule.headers,
    };
    if (rule.changeOrigin) headers.host = destination.host;

    try {
      return await proxy(destination, { raw: c.req.raw, headers });
    } catch (error) {
      logger.error(
        `${chalk.red('http proxy error:')}\n${(error as Error).stack}`,
        { timestamp: true, error: error as Error },
      );
      return c.body(null, 502);
    }
  };
}

/**
 * Warn about rules asking for something this adapter cannot do.
 *
 * Silence is the failure mode worth avoiding here: a `ws: true` rule that
 * quietly forwards nothing looks like a working configuration until a
 * WebSocket is actually needed in production (#236).
 */
export function warnUnsupportedProxyRules(
  rules: ResolvedVotProxyRule[],
  adapterName: string,
  supportsWebSocket: boolean,
): void {
  if (supportsWebSocket) return;
  for (const rule of rules) {
    if (ruleForwardsWebSocket(rule)) {
      console.warn(
        chalk.yellow(
          `[vot] proxy rule "${rule.context}" asks for WebSocket forwarding, which the "${adapterName}" adapter does not support. HTTP requests are still forwarded.`,
        ),
      );
    }
  }
}

/**
 * Warn when an upgrade arrives for a rule that forwards HTTP only.
 *
 * The mirror image of {@link warnUnsupportedProxyRules}, and the direction
 * that actually costs people: there, a rule asks for more than the adapter can
 * do; here, a rule asks for less than the client needs. Nothing breaks --
 * socket.io defaults to `['polling', 'websocket']`, so it connects over
 * long-polling, tries to upgrade, gets nowhere, and stays on polling forever.
 * The application works and simply pays for it, which is why one consumer ran
 * that way in production without noticing (#290).
 *
 * Only a request can reveal this. Whether a rule *should* forward upgrades is
 * not knowable from the configuration -- most rules are HTTP-only on purpose,
 * so warning at startup would mean warning about nearly every rule. An upgrade
 * actually arriving is the evidence that turns it into a mistake.
 *
 * The returned function warns once per rule rather than once per request: a
 * client that keeps retrying should not fill the log.
 */
export function createHttpOnlyUpgradeWarner(): (
  rule: ResolvedVotProxyRule,
) => void {
  const warned = new Set<string>();
  return (rule) => {
    if (warned.has(rule.context)) return;
    warned.add(rule.context);
    console.warn(
      chalk.yellow(
        `[vot] an upgrade request arrived for proxy rule "${rule.context}", which forwards HTTP only.\n` +
          '      Add `ws: true` to the rule (or use a ws:/wss: target) to forward WebSocket upgrades.',
      ),
    );
  };
}

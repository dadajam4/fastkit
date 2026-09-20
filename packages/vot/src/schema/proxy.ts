/**
 * Proxy rules for `vot dev` and `vot serve`.
 *
 * Deliberately narrower than Vite's `ProxyOptions`. Forwarding is done over
 * `fetch` so that it works on every runtime, and the two options Vite exposes
 * that only a Node proxy could honour -- `configure`, which hands out the
 * `http-proxy` instance, and `bypass`, which hands out the Node request and
 * response -- have no fetch equivalent. Keeping them would let `vot dev` and
 * `vot serve` drift apart, which is the one thing the server entry exists to
 * prevent.
 *
 * `secure` is absent for the same reason, and it is worth being explicit about:
 * there is no standard way to turn off TLS verification for a `fetch`, and Node
 * exposes no public one either. Declaring the option and quietly ignoring it
 * would be worse than not having it -- that is exactly the shape of #236. A
 * self-signed upstream is reached with `NODE_TLS_REJECT_UNAUTHORIZED=0` in the
 * environment, which is the user's decision to make rather than a rule's.
 */
export interface VotProxyOptions {
  /**
   * Where matching requests are sent.
   *
   * A `ws:` or `wss:` target opts the rule into WebSocket forwarding, the same
   * as setting {@link VotProxyOptions.ws}.
   */
  target: string;
  /**
   * Rewrite the `Host` header to the target's host.
   *
   * @default false
   */
  changeOrigin?: boolean;
  /**
   * Rewrite the path before forwarding.
   */
  rewrite?: (path: string) => string;
  /**
   * Extra headers to send upstream.
   */
  headers?: Record<string, string>;
  /**
   * Forward WebSocket upgrades as well as HTTP.
   *
   * Whether this can be honoured is a property of the adapter: the fetch model
   * has no notion of an upgrade, so each runtime has to do it with its own
   * API. An adapter that cannot declares `supports.proxyWebSocket: false`, and
   * vot warns at startup when a rule asks for something it cannot do.
   *
   * @default false
   */
  ws?: boolean;
}

/** A proxy rule as written in configuration: a bare target, or options. */
export type RawVotProxyOptions = string | VotProxyOptions;

export type VotProxyConfig = Record<string, RawVotProxyOptions>;

/** One rule, normalized, with the context it was registered under. */
export interface ResolvedVotProxyRule extends VotProxyOptions {
  context: string;
}

export function resolveProxyConfig(
  config: VotProxyConfig,
): ResolvedVotProxyRule[] {
  return Object.entries(config).map(([context, raw]) => {
    const options: VotProxyOptions =
      typeof raw === 'string' ? { target: raw, changeOrigin: true } : raw;
    return { context, ...options };
  });
}

/**
 * Whether a rule forwards WebSocket upgrades.
 *
 * Matches Vite: a bare string target forwards HTTP only, so the same
 * configuration behaves the same under `vot dev` and `vot serve`.
 */
export function ruleForwardsWebSocket(rule: ResolvedVotProxyRule): boolean {
  return !!rule.ws || /^wss?:/.test(rule.target);
}

/**
 * Match a request path against the context a rule was registered under.
 *
 * A context beginning with `^` is a regular expression; anything else is a
 * prefix. Unchanged from the behaviour `vot dev` inherits from Vite.
 */
export function doesProxyContextMatchUrl(
  context: string,
  url: string,
): boolean {
  return (
    (context.startsWith('^') && new RegExp(context).test(url)) ||
    url.startsWith(context)
  );
}

/** Find the first rule whose context matches, if any. */
export function matchProxyRule(
  rules: ResolvedVotProxyRule[],
  url: string,
): ResolvedVotProxyRule | undefined {
  return rules.find((rule) => doesProxyContextMatchUrl(rule.context, url));
}

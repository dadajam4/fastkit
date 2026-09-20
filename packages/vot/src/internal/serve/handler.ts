import type { VotRequestHandler } from '../../schema/adapter';
import type { Renderer } from '../../schema/renderer';

/**
 * Marks a response as "not mine".
 *
 * The fetch model has no way to say "I decline" -- a handler returns a
 * `Response` or it does not return at all -- so the catch-all says it with a
 * header that the adapter strips. Where vot is the whole server that becomes a
 * plain 404; where it is mounted inside another stack (Vite's, under
 * `vot dev`), it becomes a `next()`.
 */
export const VOT_DECLINE_HEADER = 'x-vot-decline';

export function declineResponse(): Response {
  return new Response(null, {
    status: 404,
    headers: { [VOT_DECLINE_HEADER]: '1' },
  });
}

export function isDeclined(response: Response): boolean {
  return response.headers.has(VOT_DECLINE_HEADER);
}

/**
 * Whether a path belongs to the application mounted at `base`.
 *
 * `base` always ends in `/`, and the path without that trailing slash is the
 * application root, so it counts too.
 */
export function isUnderBase(pathname: string, base: string): boolean {
  if (base === '/') return true;
  return pathname === base.slice(0, -1) || pathname.startsWith(base);
}

export interface VotRequestHandlerOptions {
  /** The built server entry. */
  render: Renderer;
  /** Client manifest, for preload links. */
  manifest?: Record<string, string[]>;
  preload?: boolean;
  /** Always begins and ends with `/`. */
  base: string;
  /** Override the HTML template. Used by `vot dev`. */
  template?: string;
}

/**
 * The render core: a request in, a response out, and nothing runtime-specific
 * in between.
 *
 * This is what every adapter mounts as its catch-all, and what a runtime that
 * takes a bare fetch handler can be handed directly.
 */
export function createVotRequestHandler(
  options: VotRequestHandlerOptions,
): VotRequestHandler {
  const { render, manifest, preload, base, template } = options;

  return async function votRequestHandler(request, runtime) {
    // Rendering answers page navigations and nothing else. Everything declined
    // here reaches whatever sits behind vot rather than becoming a 404 it
    // invented.
    if (request.method !== 'GET') return undefined;

    const url = new URL(request.url);
    if (url.pathname === '/favicon.ico') return undefined;
    if (!isUnderBase(url.pathname, base)) return undefined;

    const rendered = await render(request.url, {
      manifest,
      preload,
      template,
      request,
      runtime,
    });

    const { status, statusText } = rendered;
    const headers = new Headers(rendered.headers);
    const body = 'html' in rendered ? rendered.html : null;

    /**
     * Say what this is. Without a `Content-Type` the transport falls back to
     * `text/plain`, and a browser then shows the markup instead of rendering
     * it -- a failure no assertion on the response body can see.
     */
    if (body !== null && !headers.has('content-type')) {
      headers.set('content-type', 'text/html; charset=utf-8');
    }

    return new Response(body, {
      status: status || 200,
      ...(statusText ? { statusText } : undefined),
      headers,
    });
  };
}

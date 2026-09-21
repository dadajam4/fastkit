/**
 * @file Resolver to resolve Fetch API Exceptions
 */

import { createCatcherResolver } from '../schema';

/**
 * What a `Response` can tell you without reading its body
 *
 * Every field here is available synchronously, so it is reported whether or not
 * the body could be read.
 */
export interface FetchResponseMeta {
  /**
   * Response headers, as a plain object
   *
   * * Header names repeated in the response are combined with `, `, the same
   *   way `Headers.get()` combines them
   */
  headers: Record<string, string>;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  /**
   * Derived from the standard `Response` rather than named directly: only
   * `lib.dom.d.ts` publishes a global `ResponseType` alias, so naming it makes
   * the published declarations unusable in a Node-only program (issue #255).
   * `Response` itself is a global in both environments.
   */
  type: Response['type'];
  /** The response URL, in full -- query string included */
  url: string;
}

/**
 * A response whose body was not read
 *
 * The instance was built through a synchronous entry point, where a body -- only
 * reachable through a promise -- cannot be waited for. Build it with
 * `fromAsync` / `createAsync` to get {@link FetchResponseWithBody} instead.
 */
export interface FetchResponseWithoutBody extends FetchResponseMeta {
  /** See {@link FetchResponseWithBody.bodyRead} */
  bodyRead: false;
  /** Nothing was attempted. See {@link FetchBodyState}. */
  bodyState: 'unread';
}

/**
 * Where the body on a response came from
 *
 * `bodyRead` says whether there is a body to look at. This says how it got
 * here, which is the difference between a server that sent nothing and a body
 * this resolver could not reach:
 *
 * * `'unread'` -- nothing was attempted. The instance was built through a
 *   synchronous entry point, where a body cannot be waited for
 * * `'read'` -- read off the wire. `text` is what the server sent, and `json`
 *   is that parsed, or `null` when it is not JSON
 * * `'unavailable'` -- reading was attempted and could not happen: the body was
 *   already consumed or locked by the time the resolver got there, so there was
 *   nothing left to copy
 * * `'provided'` -- the application handed it over through
 *   {@link ExtractedFetchError.body}, having read it for its own reasons.
 *   `json` is that value and `text` is `''`, because nothing was read here
 *
 * `'read'` with an empty body and `'unavailable'` used to be the same value.
 */
export type FetchBodyState = 'read' | 'unavailable' | 'provided';

/** A response with a body to look at */
export interface FetchResponseWithBody extends FetchResponseMeta {
  /**
   * Whether there is a body on this object to look at
   *
   * Derived from {@link FetchResponseWithBody.bodyState bodyState}, and kept
   * anyway, the way `Response.ok` is kept beside `Response.status`: "can I look
   * at the body" is the question asked at almost every use site, and it
   * deserves a one-word answer rather than a comparison against two of four
   * states. `bodyState` is there for the times the answer is no and you want to
   * know why.
   */
  bodyRead: true;
  /** {@link FetchBodyState Where this body came from} */
  bodyState: FetchBodyState;
  /**
   * The body parsed as JSON, or `null` when it is not JSON
   *
   * A failed read is reported as `null` rather than raised: a resolver runs
   * while an error is being described, and must not replace it with one of
   * its own.
   */
  json: any;
  /**
   * The body as text
   *
   * What came off the wire, so `''` for `'unavailable'` -- nothing was read --
   * and `''` for `'provided'` too: the application handed over a value, not a
   * response. A synthesised `JSON.stringify` would not be what the server sent.
   */
  text: string;
}

/**
 * JSON serializable Fetch Response
 *
 * `bodyRead` says which half of the union you have, so there is no guessing
 * whether a missing `json` means "not JSON" or "never read":
 *
 * ```ts
 * const { response } = resolvedData.fetchError;
 * if (response.bodyRead) {
 *   response.json; // only in scope here
 * }
 * ```
 *
 * {@link FetchBodyState bodyState} then says where that body came from, which
 * is what separates a server that sent nothing from a body this resolver could
 * not reach.
 *
 * ## This is resolver output, not the serialized error
 *
 * It reaches a normalizer, and nothing else: `toJSON()` emits what the
 * *normalizer* returns, never `resolvedData`. So the full response is here to
 * be drawn on, and what leaves the process is the normalizer's decision.
 *
 * Copy from it deliberately. It holds what the server sent, which can include
 * `set-cookie` (session and refresh tokens, and a 401 is exactly when they are
 * rotated), a `url` carrying a signed-URL signature or a `?token=`, and a body
 * that may hold far more than the message you wanted. A normalizer that spreads
 * this wholesale puts all of it wherever the error is logged.
 */
export type SerializableFetchResponse =
  FetchResponseWithoutBody | FetchResponseWithBody;

/**
 * Serializable Fetch Error
 */
export interface SerializableFetchError {
  name?: string;
  message?: string;
  stack?: string;
  /** {@link SerializableFetchResponse JSON serializable Fetch Response } */
  response: SerializableFetchResponse;
}

/**
 * Override Fetch Error
 */
export interface FetchErrorOverrides {
  /**
   * {@link SerializableFetchResponse Fetch Error information }
   *
   * Only set when a fetch exception is detected
   */
  fetchError: SerializableFetchError;
}

/**
 * Flatten headers into a plain object
 *
 * `Object.fromEntries` would not do: `entries()` yields a repeated header once
 * per value, so `set-cookie: a` followed by `set-cookie: b` would silently keep
 * only the last. Joining with `, ` gives the same string `Headers.get()` does.
 */
function toHeaderRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    const current = record[key];
    record[key] = current === undefined ? value : `${current}, ${value}`;
  });
  return record;
}

function readMeta(response: Response): FetchResponseMeta {
  return {
    headers: toHeaderRecord(response.headers),
    ok: response.ok,
    redirected: response.redirected,
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    url: response.url,
  };
}

/**
 * Read the body without taking it from the caller
 *
 * A body can be read once. Reading `response` itself would leave the
 * application holding a drained response it can no longer read, so this reads a
 * `clone()`, which tees the stream and gives both sides one.
 *
 * Nothing here rejects. This runs while an error is being described, and a
 * failure to read a body is not a reason to throw a different error at whoever
 * is already handling one -- an unreadable body is reported as empty.
 */
async function readBody(
  response: Response,
): Promise<Pick<FetchResponseWithBody, 'bodyState' | 'json' | 'text'>> {
  let body: Response;
  try {
    // Throws if the body is already disturbed or locked -- someone else got
    // there first, so there is nothing left to copy. An application in that
    // position can hand the body over through `ExtractedFetchError.body`.
    body = response.clone();
  } catch (_err) {
    return { bodyState: 'unavailable', json: null, text: '' };
  }

  let text: string;
  try {
    text = await body.text();
  } catch (_err) {
    return { bodyState: 'unavailable', json: null, text: '' };
  }

  try {
    return { bodyState: 'read', json: JSON.parse(text), text };
  } catch (_err) {
    // Not JSON -- an HTML error page is the ordinary case here, and an empty
    // body throws too.
    return { bodyState: 'read', json: null, text };
  }
}

function isResponse(source: unknown): source is Response {
  if (!source || typeof Response === 'undefined') return false;
  return source instanceof Response;
}

/**
 * Extracted Fetch Error
 */
export interface ExtractedFetchError {
  name?: string;
  message?: string;
  stack?: string;
  /** Fetch Response */
  response: Response;
  /**
   * A body the error already holds
   *
   * An application that throws its own error for a failed fetch usually reads
   * the body first, because it needs it to build the error's message. The body
   * is then consumed, so this resolver cannot read it again -- `clone()` throws
   * on a disturbed body -- and the structured part of it, the `code` and the
   * field-level errors that are the whole reason to normalize, would be lost.
   *
   * Hand it over and it is used as-is, reported as
   * {@link FetchBodyState `bodyState: 'provided'`}. This is not the consumer
   * doing the resolver's job: the application read the body for its own
   * reasons, and this is the resolver being willing to use what is already
   * there rather than insisting on reading it again.
   *
   * ```ts
   * fetchResponseResolver((source) =>
   *   source instanceof ApiResponseError
   *     ? { response: source.response, body: source.body }
   *     : undefined,
   * );
   * ```
   *
   * A body that arrives this way needs no `await`, so `from` is enough where
   * `fromAsync` would otherwise be required.
   *
   * `undefined` means no body was handed over. A body that is genuinely
   * `null` -- the response was JSON `null` -- is carried through as `null`.
   */
  body?: unknown;
}

/**
 * Extract function for fetch errors
 */
export type ExtractFetchError = (
  source: unknown,
) => ExtractedFetchError | undefined;

const DEFAULT_EXTRACT_FETCH_ERROR: ExtractFetchError = (source) => {
  if (isResponse(source)) {
    return {
      response: source,
    };
  }
  if (source instanceof Error) {
    const maybeResponse = (source as any).response || (source as any).res;
    const response = isResponse(maybeResponse) ? maybeResponse : undefined;
    if (!response) return;

    return {
      name: source.name,
      message: source.message,
      stack: source.stack,
      response,
      // Only once a `Response` has been found on the error: a `body` sitting
      // next to one is that response's body, read by the application on its
      // way to building this error's message.
      body: (source as any).body,
    };
  }
};

/**
 * Resolver to resolve fetch exceptions
 *
 * * Since the Fetch API does not throw communication exceptions, this resolver expects the application to throw an exception in response to the fetch result
 * * Since the structure of exceptions to throw varies from application to application, this method can be used to set up a custom error extraction function
 * * If the error extraction function is unspecified, the exception to be thrown is expected to be a Response object, or to have a response object named `response` or `res` in the error instance.
 *
 * ## Build with `fromAsync` to get the body
 *
 * A `Response` hands out its body through a promise and no other way, so a
 * synchronously built instance reports the response metadata and
 * `bodyRead: false`. The body is what usually carries the message worth
 * reporting, so where you can await -- a `catch` in an async function, which is
 * where fetch errors live -- reach for the async entry point:
 *
 * ```ts
 * try {
 *   await api.getUser(id);
 * } catch (e) {
 *   throw await AppError.fromAsync(e);
 * }
 * ```
 */
export const fetchResponseResolver = (
  extract: ExtractFetchError = DEFAULT_EXTRACT_FETCH_ERROR,
) =>
  createCatcherResolver(
    (
      source,
      ctx,
    ): FetchErrorOverrides | Promise<FetchErrorOverrides> | undefined => {
      const extracted = extract(source);
      if (!extracted) return;

      const { name, message, stack, response, body } = extracted;
      const meta = readMeta(response);

      ctx.resolve();

      if (body !== undefined) {
        // Already in hand, so there is nothing to wait for and nothing to take
        // from the caller. `from` is enough here.
        return {
          fetchError: {
            name,
            message,
            stack,
            response: {
              bodyRead: true,
              bodyState: 'provided',
              json: body,
              text: '',
              ...meta,
            },
          },
        };
      }

      if (!ctx.canAwait) {
        // The body is right there and cannot be waited for. Say so, rather than
        // hand back a `bodyRead: false` that looks like a response without one.
        ctx.degraded?.('response body');
        return {
          fetchError: {
            name,
            message,
            stack,
            response: { bodyRead: false, bodyState: 'unread', ...meta },
          },
        };
      }

      return readBody(response).then((read) => ({
        fetchError: {
          name,
          message,
          stack,
          response: { bodyRead: true, ...meta, ...read },
        },
      }));
    },
  );

/* eslint-disable no-console */
import { defer } from './defer';
import type {
  WrittenResponse,
  WriteResponseFn,
  RedirectFn,
  PageResponseDraft,
} from '../schema';

const isRedirect = ({ status = 0 }) => status >= 300 && status < 400;

/**
 * Snapshot the draft as the value the renderer returns.
 *
 * `WrittenResponse.headers` is a `Record<string, string>`, so a multi-value
 * header cannot survive this hop. Nothing writes one yet — cookies still go
 * straight to the Node response — and retiring this conversion is precisely
 * what the draft's `Headers` is there to make possible.
 *
 * Keys are omitted rather than set to `undefined`, because the result is
 * spread over the rendered payload and an explicit `undefined` would erase
 * whatever was already there.
 */
function toWrittenResponse(draft: PageResponseDraft): WrittenResponse {
  const written: WrittenResponse = {};
  if (draft.status !== undefined) written.status = draft.status;
  if (draft.statusText !== undefined) written.statusText = draft.statusText;

  const headers: Record<string, string> = {};
  draft.headers.forEach((value, key) => {
    headers[key] = value;
  });
  if (Object.keys(headers).length) written.headers = headers;

  return written;
}

export function useSsrResponse() {
  const deferred = defer<WrittenResponse>();

  /**
   * The single piece of response state for this render. The page layer is
   * handed this object and writes its status into it; `writeResponse` is the
   * same store reached through a callback, kept because it is also what
   * signals a redirect.
   */
  const draft: PageResponseDraft = { headers: new Headers() };

  const writeResponse: WriteResponseFn = (params) => {
    if (params.status !== undefined) draft.status = params.status;
    if (params.statusText !== undefined) draft.statusText = params.statusText;
    if (params.headers) {
      Object.entries(params.headers).forEach(([key, value]) => {
        draft.headers.set(key, value);
      });
    }
    if (isRedirect(params)) {
      // Stop waiting for rendering when redirecting
      deferred.resolve(toWrittenResponse(draft));
    }
  };

  return {
    deferred,
    draft,
    response: () => toWrittenResponse(draft),
    writeResponse,
    isRedirect: () => isRedirect(draft),
    redirect: (location: string, status = 302) =>
      writeResponse({ headers: { location }, status }),
  };
}

const externalRedirect: RedirectFn = (location) => {
  window.location.href = location;
};

export function useClientRedirect(spaRedirect = externalRedirect) {
  return {
    writeResponse: () =>
      console.warn('[SSR] Do not call writeResponse in browser'),
    redirect: (location: string, status?: number) =>
      location.startsWith('/')
        ? spaRedirect(location)
        : externalRedirect(location),
  };
}

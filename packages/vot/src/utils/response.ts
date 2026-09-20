/* eslint-disable no-console */
import { defer } from './defer';
import type { WriteResponseFn, RedirectFn, PageResponseDraft } from '../schema';

const isRedirect = ({ status = 0 }: { status?: number }) =>
  status >= 300 && status < 400;

export function useSsrResponse() {
  const deferred = defer<PageResponseDraft>();

  /**
   * The one piece of response state for this render.
   *
   * The page layer is handed this object and writes its status into it;
   * `writeResponse` is the same store reached through a callback, kept because
   * it is also what signals a redirect. Its `headers` is a `Headers`, so a
   * multi-value header -- `Set-Cookie` above all -- survives being written.
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
      deferred.resolve(draft);
    }
  };

  return {
    deferred,
    draft,
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

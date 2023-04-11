import { defer } from './defer';
import type { WrittenResponse, WriteResponseFn, RedirectFn } from '../schemes';

const isRedirect = ({ status = 0 }) => status >= 300 && status < 400;

export function useSsrResponse() {
  const deferred = defer<WrittenResponse>();
  const response = {} as WrittenResponse;

  const writeResponse: WriteResponseFn = (params) => {
    Object.assign(response, params);
    if (isRedirect(params)) {
      // Stop waiting for rendering when redirecting
      deferred.resolve(response);
    }
  };

  return {
    deferred,
    response,
    writeResponse,
    isRedirect: () => isRedirect(response),
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
    redirect: (location: string, status?: number) => {
      return location.startsWith('/')
        ? spaRedirect(location)
        : externalRedirect(location);
    },
  };
}

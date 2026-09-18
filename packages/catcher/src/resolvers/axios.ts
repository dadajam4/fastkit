/**
 * @file Resolver to resolve [axios](https://github.com/axios/axios) exceptions
 *
 * Every type here is structural, and nothing in this file imports `axios`.
 * `axios` is an *optional* peer, but a declaration file has no notion of an
 * optional import: naming `axios` in one forces every consumer's type checker
 * to resolve it, installed or not, and that is what issue #233 reported. The
 * runtime never needed it either -- an axios error is recognised by the
 * `isAxiosError` marker it carries.
 *
 * TypeScript is structural, so a real `AxiosError` still satisfies
 * {@link AxiosErrorLike} and callers pass one unchanged.
 */

import { createCatcherResolver } from '../schema';

/**
 * The part of an axios error this resolver reads.
 *
 * Deliberately loose about `config` and `response`: their contents are copied
 * into {@link AxiosErrorInfo} for serialization, not inspected here.
 */
export interface AxiosErrorLike {
  /** axios' own marker, which is how such an error is recognised. */
  isAxiosError: boolean;
  name: string;
  message: string;
  stack?: string;
  code?: string;
  config?: Record<string, any>;
  response?: {
    data: any;
    status: number;
    statusText: string;
    headers: any;
  };
}

/**
 * Verify that the value of the specified argument is an axios error
 *
 * @param source - Value to be checked
 * @returns true if it is an axios error
 */
function isAxiosError(source: unknown): source is AxiosErrorLike {
  return (
    !!source &&
    typeof source === 'object' &&
    (source as AxiosErrorLike).isAxiosError === true
  );
}

const ConfigPicks = [
  'url',
  'method',
  'baseURL',
  'headers',
  'params',
  'data',
  'timeout',
  'responseType',
  'xsrfCookieName',
  'xsrfHeaderName',
  'maxContentLength',
  'maxBodyLength',
  'maxRedirects',
  'socketPath',
  'proxy',
] as const;

/**
 * The methods axios names, mirroring its own `Method`.
 *
 * Composed the same way axios composes it — the uppercase set plus its
 * lowercase forms — and, where it is used, followed by `(string & {})` so any
 * other method is still accepted, exactly as axios' `StringLiteralsOrString`
 * does. Spelling it out keeps the completion list without naming the module.
 */
type HttpMethod =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'PURGE'
  | 'LINK'
  | 'UNLINK'
  | 'QUERY';

/**
 * JSON serializable axios request config
 *
 * The {@link ConfigPicks} subset of axios' request config, typed for what it is
 * *after* the copy: a plain JSON-serializable object. `headers` in particular
 * may have been an `AxiosHeaders` instance before it was copied, so claiming
 * axios' own type for it here would be the less accurate of the two — the same
 * reason {@link SerializableAxiosResponse} types `data` and `headers` as `any`.
 */
export interface SerializableAxiosRequestConfig {
  url?: string;
  method?: HttpMethod | Lowercase<HttpMethod> | (string & {});
  baseURL?: string;
  headers?: any;
  params?: any;
  data?: any;
  /** Milliseconds. */
  timeout?: number;
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
    | 'formdata';
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  maxBodyLength?: number;
  maxRedirects?: number;
  socketPath?: string | null;
  proxy?:
    | {
        host: string;
        port: number;
        auth?: { username: string; password: string };
        protocol?: string;
      }
    | false;
  fullUrl?: string;
}

/**
 * JSON serializable axios response
 */
export interface SerializableAxiosResponse {
  data: any;
  status: number;
  statusText: string;
  headers: any;
}

/**
 * axios error information
 */
export interface AxiosErrorInfo {
  name: string;
  message: string;
  stack?: string;
  config: SerializableAxiosRequestConfig;
  code?: string;
  response?: SerializableAxiosResponse;
}

/**
 * Override axios error
 */
export interface AxiosErrorOverrides {
  /**
   * {@link AxiosErrorInfo axios error information }
   *
   * Only set when an axios exception is detected
   */
  axiosError: AxiosErrorInfo;
}

export function toAxiosErrorInfo(source: AxiosErrorLike): AxiosErrorInfo {
  const {
    name,
    message,
    stack,
    config: _config,
    code,
    response: _response,
  } = source;
  const config: SerializableAxiosRequestConfig = {};
  _config &&
    ConfigPicks.forEach((prop) => {
      // Copying a fixed key list out of an untyped bag; the shape is asserted
      // by `SerializableAxiosRequestConfig` above.
      (config as Record<string, unknown>)[prop] = _config[prop];
    });
  let response: SerializableAxiosResponse | undefined;
  if (_response) {
    response = {
      data: _response.data,
      status: _response.status,
      statusText: _response.statusText,
      headers: _response.headers,
    };
  }
  return {
    name,
    message,
    stack,
    config,
    code,
    response,
  };
}

/**
 * Resolver to resolve [axios](https://github.com/axios/axios) exceptions
 */
export const axiosErrorResolver = createCatcherResolver(
  (source, ctx): AxiosErrorOverrides | undefined => {
    if (!isAxiosError(source)) return;

    const axiosError = toAxiosErrorInfo(source);

    ctx.resolve();

    return {
      axiosError,
    };
  },
);

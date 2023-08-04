/**
 * @file Resolver to resolve [axios](https://github.com/axios/axios) exceptions
 */

import type { AxiosError, AxiosRequestConfig } from 'axios';
import { createCatcherResolver } from '../schemes';

/**
 * Verify that the value of the specified argument is an axios error
 *
 * @param source - Value to be checked
 * @returns true if it is an axios error
 */
function isAxiosError(source: unknown): source is AxiosError {
  return (
    !!source &&
    typeof source === 'object' &&
    (source as AxiosError).isAxiosError === true
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
 * JSON serializable axios request config
 */
export interface SerializableAxiosRequestConfig
  extends Pick<AxiosRequestConfig, (typeof ConfigPicks)[number]> {
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

export function toAxiosErrorInfo(source: AxiosError): AxiosErrorInfo {
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
      config[prop] = _config[prop];
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
  function axiosErrorResolver(source, ctx): AxiosErrorOverrides | undefined {
    if (!isAxiosError(source)) return;

    const axiosError = toAxiosErrorInfo(source);

    ctx.resolve();

    return {
      axiosError,
    };
  },
);

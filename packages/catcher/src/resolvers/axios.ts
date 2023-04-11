import type { AxiosError, AxiosRequestConfig } from 'axios';
import { createCatcherResolver } from '../schemes';

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

export interface SerializableAxiosRequestConfig
  extends Pick<AxiosRequestConfig, (typeof ConfigPicks)[number]> {
  fullUrl?: string;
}

export interface SerializableAxiosResponse {
  data: any;
  status: number;
  statusText: string;
  headers: any;
}

export interface AxiosErrorInfo {
  name: string;
  message: string;
  stack?: string;
  config: SerializableAxiosRequestConfig;
  code?: string;
  response?: SerializableAxiosResponse;
}

export interface AxiosErrorOverrides {
  // name: string;
  // message: string;
  // stack?: string;
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

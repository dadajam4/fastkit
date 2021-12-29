import { createCatcherResolver } from '../schemes';

export interface SerializableFetchResponse {
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  json: any;
  text: string;
}

export interface FetchError {
  message: string;
  response: SerializableFetchResponse;
}

export interface FetchErrorOverrides {
  fetchError: SerializableFetchResponse;
  // name: string;
  // message: string;
  // fetchResponse: SerializableFetchResponse;
}

export const fetchResponseResolver = createCatcherResolver(
  function fetchResponseResolver(source, ctx): FetchErrorOverrides | undefined {
    if (typeof Response === 'undefined' || !(source instanceof Response))
      return;
    const fetchResponse: SerializableFetchResponse = {
      headers: source.headers,
      ok: source.ok,
      redirected: source.redirected,
      status: source.status,
      statusText: source.statusText,
      type: source.type,
      url: source.url,
      json: null,
      text: '',
    };

    source.json().then((json) => {
      fetchResponse.json = json;
    });
    source.text().then((text) => {
      fetchResponse.text = text;
    });

    ctx.resolve();

    return {
      fetchError: fetchResponse,
    };
  },
);

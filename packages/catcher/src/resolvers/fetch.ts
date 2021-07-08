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

export interface FetchErrorOverrides {
  name: string;
  message: string;
  fetchResponse: SerializableFetchResponse;
}

export function fetchResponseResolver(
  source: Response,
): FetchErrorOverrides | undefined {
  if (!(source instanceof Response)) return;
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

  return {
    name: 'FetchError',
    message: fetchResponse.statusText,
    fetchResponse,
  };
}

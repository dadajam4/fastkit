/**
 * @file Resolver to resolve Fetch API Exceptions
 */

import { createCatcherResolver } from '../schemes';

/**
 * JSON serializable Fetch Response
 */
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
   * Only set when an axios exception is detected
   */
  fetchError: SerializableFetchError;
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
    };
  }
};

/**
 * Resolver to resolve fetch exceptions
 *
 * * Since the Fetch API does not throw communication exceptions, this resolver expects the application to throw an exception in response to the fetch result
 * * Since the structure of exceptions to throw varies from application to application, this method can be used to set up a custom error extraction function
 * * If the error extraction function is unspecified, the exception to be thrown is expected to be a Response object, or to have a response object named `response` or `res` in the error instance.
 */
export const fetchResponseResolver = (
  extract: ExtractFetchError = DEFAULT_EXTRACT_FETCH_ERROR,
) =>
  createCatcherResolver((source, ctx): FetchErrorOverrides | undefined => {
    const extracted = extract(source);
    if (!extracted) return;

    const { name, message, stack, response } = extracted;

    const fetchResponse: SerializableFetchResponse = {
      headers: response.headers,
      ok: response.ok,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      json: null,
      text: '',
    };

    response.json().then((json) => {
      fetchResponse.json = json;
    });

    response.text().then((text) => {
      fetchResponse.text = text;
    });

    ctx.resolve();

    return {
      fetchError: {
        name,
        message,
        stack,
        response: fetchResponse,
      },
    };
  });

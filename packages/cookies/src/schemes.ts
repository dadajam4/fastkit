import type { IncomingMessage, ServerResponse } from 'node:http';
export type { CookieParseOptions, CookieSerializeOptions } from 'cookie';

export type CookiesBrowserContext = Document;

export interface CookiesNodeContext {
  req?: IncomingMessage;
  res?: ServerResponse;
}

export type CookiesServerContext = CookiesNodeContext;

export type CookiesContext = CookiesBrowserContext | CookiesServerContext;

export type CookiesBucket = Record<string, string>;

export interface OnCookiesChangeEvent {
  name: string;
  value: string | undefined;
}

export interface CookiesEventMap {
  change: OnCookiesChangeEvent;
}

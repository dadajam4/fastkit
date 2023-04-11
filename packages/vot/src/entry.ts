import { createEntry as createClientEntry } from './entry-client';
import { createEntry as createServerEntry } from './entry-server';
import type { Component } from 'vue';
import { CreateEntryOptions, Hook, AnyHandlerResult } from './schemes';

export function createEntry(
  App: Component,
  options: CreateEntryOptions,
  hook?: Hook,
): AnyHandlerResult {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const _createEntry = import.meta.env.SSR
    ? createServerEntry
    : createClientEntry;
  return _createEntry(App, options, hook);
}

import { createEntry as createClientEntry } from './entry-client';
import { createEntry as createServerEntry } from './entry-server';
import type { Component } from 'vue';
import { CreateEntryOptions, Hook, AnyHandlerResult } from './schemes';

export function createEntry(
  App: Component,
  options: CreateEntryOptions,
  hook?: Hook,
): AnyHandlerResult {
  const _createEntry = __NODE_JS__ ? createServerEntry : createClientEntry;
  return _createEntry(App, options, hook);
}

// import type { App } from 'vue';
import { SharedOptions, SharedContext } from '../utils/types';
import clientEntry from './entry-client';
import serverEntry from './entry-server';

export interface CreateEntryOptions extends SharedOptions {
  routes: Array<Record<string, any>>;
  routerOptions?: Record<string, any>;
}

export interface CreateEntryHookContext extends SharedContext {
  app: any;
  router: any;
  initialRoute: any;
}

export type CreateEntryHook = (params: CreateEntryHookContext) => any;

export function createEntry(
  App: any,
  options: CreateEntryOptions,
  hook?: CreateEntryHook,
): any {
  const entry = typeof window === 'undefined' ? serverEntry : clientEntry;
  console.log(typeof window === 'undefined', entry);
  return entry(App, options, hook);
}

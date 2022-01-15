import type { VuePageControl } from '@fastkit/vue-page';

export type VotPluginFn = (ctx: VuePageControl) => any | Promise<any>;

export interface VotPlugin {
  setup: VotPluginFn;
}

export type RawVotPlugin = VotPluginFn | VotPlugin;

/**
 * @internal
 */
export function resolveRawVotPlugin(raw: RawVotPlugin) {
  return typeof raw === 'function' ? { setup: raw } : raw;
}

export function createVotPlugin(source: RawVotPlugin) {
  return resolveRawVotPlugin(source);
}

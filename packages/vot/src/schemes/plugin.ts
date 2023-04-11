import type { VuePageControl } from '@fastkit/vue-page';
import { VotPluginHooksChunk, VotHooks } from './hooks';

export type VotPluginFn = (ctx: VuePageControl) => any | Promise<any>;

export interface VotPlugin extends VotPluginHooksChunk {
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

export interface VotPluginsAndHooks {
  plugins: VotPlugin[];
  hooks: VotHooks;
}

export function setupVotPluginsAndHooks(rawVotPlugins?: RawVotPlugin[]) {
  const plugins = rawVotPlugins
    ? rawVotPlugins.map((raw) => resolveRawVotPlugin(raw))
    : [];
  const hooks = new VotHooks(plugins);
  return {
    plugins,
    hooks,
  };
}

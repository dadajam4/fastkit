import { UserHooks } from './hook';
import type { Listable } from '../utils/general';
import type { ESBuildPlugin } from './esbuild';
import type { PlugboyWorkspace } from '../workspace';

export type ESBuildPluginOption =
  | ESBuildPlugin
  | undefined
  | false
  | null
  | Promise<ESBuildPlugin | undefined | false | null>
  | ((
      workspace: PlugboyWorkspace,
    ) =>
      | ESBuildPlugin
      | undefined
      | false
      | null
      | Promise<ESBuildPlugin | undefined | false | null>);

export interface Plugin {
  name: string;
  hooks?: UserHooks;
  esbuildPlugins?: ESBuildPluginOption[];
}

export type UserPluginOption = Listable<Plugin>;

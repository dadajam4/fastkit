import { UserPluginOption, Plugin } from '../types';
import { resolveListable } from './general';
import { loadProjectConfig } from './project';

export async function resolveUserPluginOptions(
  pluginOptions: UserPluginOption[] | undefined,
): Promise<Plugin[]> {
  if (!pluginOptions) return [];
  return resolveListable(pluginOptions);
}

export function definePlugin<T extends Plugin>(options: T): T {
  return options;
}

export async function extractProjectPlugins(
  searchDir?: string,
): Promise<Plugin[]> {
  const config = await loadProjectConfig(searchDir);
  return config ? config.plugins : [];
}

export async function findProjectPlugin<T extends Plugin = Plugin>(
  pluginName: string,
  searchDir?: string,
): Promise<T | undefined> {
  const plugins = await extractProjectPlugins(searchDir);
  return plugins.find((plugin) => plugin.name === pluginName) as T | undefined;
}

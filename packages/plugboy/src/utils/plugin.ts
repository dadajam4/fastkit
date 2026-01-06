import { UserPluginOption, Plugin } from '../types';
import { loadProjectConfig } from './project';

export async function resolveUserPluginOption(
  pluginOption: UserPluginOption | undefined,
): Promise<Plugin[]> {
  if (!pluginOption) return [];

  const awaited = await pluginOption;
  if (!awaited) return [];

  if (Array.isArray(pluginOption)) {
    return (
      await Promise.all(
        pluginOption.map((o) => resolveUserPluginOption(o)).flat(),
      )
    ).flat();
  }
  return [awaited as Plugin];
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

import { PackageJson } from 'pkg-types';
import { bundleRequire } from 'bundle-require';
import {
  WorkspacePackageJson,
  WORKSPACE_REQUIRED_FIELDS,
  UserWorkspaceConfig,
  ResolvedWorkspaceConfig,
  RawWorkspaceEntryObject,
  RawWorkspaceEntry,
  WorkspaceEntry,
  RawWorkspaceEntries,
  WorkspaceEntries,
} from '../types';
import { findConfig } from './file';
import {
  WORKSPACE_CONFIG_BASENAME,
  SEARCH_BUNDLE_EXTENSIONS_MATCH,
} from '../constants';
import { resolveUserPluginOptions } from './plugin';

export function isWorkspacePackageJson(
  json: PackageJson,
): json is WorkspacePackageJson {
  return (
    !json.private && WORKSPACE_REQUIRED_FIELDS.every((filed) => !!json[filed])
  );
}

export function resolveRawWorkspaceEntry(
  entry: RawWorkspaceEntry,
): WorkspaceEntry {
  const { src, css }: RawWorkspaceEntryObject =
    typeof entry === 'string' ? { src: entry } : entry;
  return {
    src,
    css: css || src.endsWith('.css') || src.endsWith('.scss'),
  };
}

export function resolveRawWorkspaceEntries(
  entries: RawWorkspaceEntries | undefined,
): WorkspaceEntries {
  if (!entries) return {};
  return Object.fromEntries(
    Object.entries(entries).map(([name, raw]) => [
      name,
      resolveRawWorkspaceEntry(raw),
    ]),
  );
}

export async function resolveUserWorkspaceConfig(
  userConfig: UserWorkspaceConfig,
): Promise<ResolvedWorkspaceConfig> {
  const { ignoreProjectConfig = false, entries, plugins } = userConfig;
  return {
    ...userConfig,
    ignoreProjectConfig,
    entries: resolveRawWorkspaceEntries(entries),
    plugins: await resolveUserPluginOptions(plugins),
  };
}

export function defineWorkspaceConfig<Config extends UserWorkspaceConfig>(
  config: Config,
): Promise<ResolvedWorkspaceConfig> {
  return resolveUserWorkspaceConfig(config);
}

export async function loadWorkspaceConfig(
  searchDir?: string,
  depth?: number,
): Promise<ResolvedWorkspaceConfig> {
  const hit = await findConfig(
    {
      fileName: `${WORKSPACE_CONFIG_BASENAME}.${SEARCH_BUNDLE_EXTENSIONS_MATCH}`,
      depth,
      allowMissing: true,
    },
    searchDir,
  );

  const userConfig = hit
    ? (
        await bundleRequire<{
          default: UserWorkspaceConfig | Promise<UserWorkspaceConfig>;
        }>({
          filepath: hit.path,
        })
      ).mod.default
    : ({} as UserWorkspaceConfig);

  return resolveUserWorkspaceConfig(await userConfig);
}

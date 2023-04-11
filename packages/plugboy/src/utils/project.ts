import { PackageJson } from 'pkg-types';
import { bundleRequire } from 'bundle-require';
import {
  ProjectPackageJson,
  PROJECT_REQUIRED_FIELDS,
  UserProjectConfig,
  ResolvedProjectConfig,
} from '../types';
import {
  PROJECT_CONFIG_BASENAME,
  SEARCH_BUNDLE_EXTENSIONS_MATCH,
} from '../constants';
import { findConfig } from './file';
import { resolveUserPluginOptions } from './plugin';

export function isProjectPackageJson(
  json: PackageJson,
): json is ProjectPackageJson {
  return (
    !!json.private && PROJECT_REQUIRED_FIELDS.every((filed) => !!json[filed])
  );
}

export async function resolveUserProjectConfig(
  userConfig: UserProjectConfig,
): Promise<ResolvedProjectConfig> {
  const {
    workspacesDir = 'packages',
    scripts = [],
    peerDependencies = {},
    tsconfig,
    readme = (json) => `# ${json.name}\n`,
    plugins,
  } = userConfig;
  return {
    workspacesDir,
    scripts: Array.isArray(scripts) ? scripts : [{ name: '', scripts }],
    peerDependencies,
    tsconfig,
    readme,
    plugins: await resolveUserPluginOptions(plugins),
  };
}

export function defineProjectConfig<Config extends UserProjectConfig>(
  config: Config,
): Promise<ResolvedProjectConfig> {
  return resolveUserProjectConfig(config);
}

export async function loadProjectConfig(
  searchDir?: string,
  depth?: number,
): Promise<ResolvedProjectConfig> {
  const hit = await findConfig(
    {
      fileName: `${PROJECT_CONFIG_BASENAME}.${SEARCH_BUNDLE_EXTENSIONS_MATCH}`,
      depth,
      allowMissing: true,
    },
    searchDir,
  );

  const userConfig = hit
    ? (
        await bundleRequire<{
          default: UserProjectConfig | Promise<UserProjectConfig>;
        }>({
          filepath: hit.path,
        })
      ).mod.default
    : ({} as UserProjectConfig);

  return resolveUserProjectConfig(await userConfig);
}

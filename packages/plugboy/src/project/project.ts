import {
  ProjectSetupContext,
  ProjectPackageJson,
  ResolvedProjectConfig,
  UserHooks,
} from '../types';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Path } from '../path';
import glob from 'glob';
import { getProjectPackageJson } from '../package';
import {
  isWorkspacePackageJson,
  loadProjectConfig,
  resolveUserProjectConfig,
} from '../utils';
import { PACKAGE_JSON_FILENAME } from '../constants';

/**
 * Plugboy Project
 *
 * @remarks This instance is only created if the project consists of a mono-repo.
 */
export class PlugboyProject {
  /** Path instance of the project directory */
  readonly dir: Path;
  /** package.json */
  readonly json: ProjectPackageJson;
  /**
   * Project Configuration
   * @see {@link ResolvedProjectConfig}
   */
  readonly config: ResolvedProjectConfig;
  /** Names of all packages on which the project depends */
  readonly dependencies: string[];
  /** Directory names of all workspaces owned by the project */
  readonly resolvedWorkspaces: string[];

  /**
   * Name of the project's package.json
   */
  get name() {
    return this.json.name;
  }

  /**
   * Plug-in List
   * @see {@link ResolvedProjectConfig.plugins}
   */
  get plugins() {
    return this.config.plugins;
  }

  /**
   * List of all user hook settings
   * @see {@link UserHooks}
   */
  get hooks(): UserHooks[] {
    const { hooks: _hooks, plugins } = this.config;
    const pluginHooks = plugins.map((plugin) => plugin.hooks);
    return [_hooks, ...pluginHooks].filter((hook): hook is UserHooks => !!hook);
  }

  constructor(ctx: ProjectSetupContext) {
    const { dir, json, config, resolvedWorkspaces } = ctx;

    this.dir = dir;
    this.json = json;
    this.config = config;

    const allDeps = {
      ...json.dependencies,
      ...json.devDependencies,
    };

    this.dependencies = Object.keys(allDeps);
    this.resolvedWorkspaces = resolvedWorkspaces;
  }
}

export async function getProject<
  AllowMissing extends boolean | undefined = false,
>(
  searchDir?: string,
  allowMissing?: AllowMissing,
  skipLoadConfig?: boolean,
): Promise<AllowMissing extends true ? PlugboyProject | null : PlugboyProject> {
  const hit = await getProjectPackageJson(searchDir, allowMissing);
  if (!hit) {
    return null as any;
  }
  const { dir, json } = hit;
  const resolvedWorkspaces: string[] = [];
  const { workspaces = [] } = json;
  const workspacesPattern = workspaces.map(
    (workspace) => dir.join(workspace, PACKAGE_JSON_FILENAME).value,
  );
  const workspaceHits = await glob(workspacesPattern);
  for (const hit of workspaceHits) {
    const json = JSON.parse(await fs.readFile(hit, 'utf-8'));
    if (!isWorkspacePackageJson(json)) {
      continue;
    }
    resolvedWorkspaces.push(path.dirname(hit));
  }
  resolvedWorkspaces.sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  const config = skipLoadConfig
    ? await resolveUserProjectConfig({})
    : await loadProjectConfig(dir.value, 0);

  const ctx: ProjectSetupContext = {
    dir,
    json,
    config,
    resolvedWorkspaces,
  };

  return new PlugboyProject(ctx);
}

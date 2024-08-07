import sortPackageJson from 'sort-package-json';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  rmrf,
  loadWorkspaceConfig,
  resolveUserHooks,
  buildHooks,
} from '../utils';
import {
  ProjectPackageJson,
  WorkspacePackageJson,
  ResolvedWorkspaceConfig,
  WorkspaceDirs,
  WorkspaceSetupContext,
  WorkspaceMeta,
  Plugin,
  UserHooks,
  BuildedHooks,
  ESBuildPlugin,
  mergeDTSSettingsList,
  NormalizedDTSSettings,
  ResolvedOptimizeCSSOptions,
  resolveOptimizeCSSOptions,
} from '../types';
import { Path } from '../path';
import { WORKSPACE_SPEC_PREFIX, PACKAGE_JSON_FILENAME } from '../constants';
import { PlugboyProject, getProject } from '../project';
import { Builder } from './builder';
import { getWorkspacePackageJson } from '../package';

export type WorkspaceStubLink =
  | {
      type: 'js';
      from: string;
      to: string;
    }
  | {
      type: 'css';
      from: string;
    };

export type WorkspaceStubLinkType = WorkspaceStubLink['type'];

export interface WorkspaceObjectExport {
  src: string;
  types: string;
  dtsDest: string;
  import: {
    default: string;
  };
}

function extractWorkspaceObjectExport(at: string | WorkspaceObjectExport) {
  if (typeof at === 'string') return at;
  const { types, import: _import } = at;
  return {
    types,
    import: _import,
  };
}

export interface WorkspaceExport {
  id: string;
  at: string | WorkspaceObjectExport;
  stubLink?: WorkspaceStubLink;
}

export const WORKSPACE_PACKAGE_SYNC_FIELDS = [
  'repository',
  'author',
  'publishConfig',
  'license',
] as const;

export function syncWorkspacePackageFields(
  projectJSON: ProjectPackageJson,
  workspaceJSON: WorkspacePackageJson,
) {
  for (const field of WORKSPACE_PACKAGE_SYNC_FIELDS) {
    const value = projectJSON[field];
    if (value && !workspaceJSON[field]) {
      workspaceJSON[field] = value;
    }
  }
}

const BUILD_TARGET_SRC_MATCH_RE = /\.(tsx?|s?css)$/;

export class PlugboyWorkspace {
  readonly name: string;

  readonly dir: Path;

  readonly config: ResolvedWorkspaceConfig;

  readonly project: PlugboyProject | null;

  readonly dirs: WorkspaceDirs;

  readonly dependencies: string[];

  readonly projectDependencies: string[];

  readonly meta: WorkspaceMeta;

  readonly entry: Record<string, string>;

  readonly exports: WorkspaceExport[];

  readonly builder: Builder;

  readonly plugins: Plugin[];

  readonly hooks: BuildedHooks;

  readonly dtsFiles: string[] = [];

  readonly dts: NormalizedDTSSettings;

  readonly optimizeCSSOptions: ResolvedOptimizeCSSOptions | false;

  private _json: WorkspacePackageJson;

  get json() {
    return this._json;
  }

  constructor(ctx: WorkspaceSetupContext) {
    const {
      dir,
      json,
      config,
      project,
      dirs,
      dependencies,
      projectDependencies,
      meta,
      plugins,
      hooks,
      dts,
      optimizeCSS,
    } = ctx;

    this.name = dir.basename;
    this.dir = dir;
    this._json = json;
    this.project = project;
    this.dirs = dirs;
    this.dependencies = dependencies;
    this.projectDependencies = projectDependencies;
    this.meta = meta;
    this.config = config;
    this.plugins = plugins;
    this.hooks = hooks;
    this.dts = dts;
    this.optimizeCSSOptions = optimizeCSS
      ? resolveOptimizeCSSOptions(optimizeCSS)
      : false;

    const entry: Record<string, string> = {};
    const exports: WorkspaceExport[] = [
      {
        id: `./${PACKAGE_JSON_FILENAME}`,
        at: `./${PACKAGE_JSON_FILENAME}`,
      },
    ];

    Object.entries(config.entries).forEach(([id, { src, css }]) => {
      if (!BUILD_TARGET_SRC_MATCH_RE.test(src)) return;

      const isMainEntry = id === '.';
      const normalizedId = isMainEntry ? this.name : id;
      const exportId = id.startsWith('.') ? id : `./${id}`;
      const srcIsCSS = src.endsWith('.css') || src.endsWith('.scss');
      const ext = srcIsCSS ? 'css' : 'mjs';
      const dest = `./dist/${normalizedId}.${ext}`;
      const destFullPath = dir.join(dest).value;

      entry[normalizedId] = src;

      if (css) {
        const cssDest = `./dist/${normalizedId}.css`;
        exports.push({
          id: `./${normalizedId}.css`,
          at: cssDest,
          stubLink: {
            type: 'css',
            from: cssDest,
          },
        });

        if (srcIsCSS) return;
      }

      const types = `./dist/${normalizedId}.d.ts`;
      const dtsDest = `./dist/${src
        .replace(/^\.\/src/, '.dts')
        .replace(/\.ts$/, '.d.ts')}`;

      this.dtsFiles.push(dir.join(types).value);
      exports.push({
        id: exportId,
        at: {
          src,
          types,
          dtsDest,
          import: {
            default: dest,
          },
        },
        stubLink: {
          from: destFullPath,
          to: path.isAbsolute(src) ? src : dir.join(src).value,
          type: 'js',
        },
      });
    });

    this.entry = entry;
    this.exports = exports;
    this.builder = new Builder(this);
  }

  clean(withDepsAndCache?: boolean) {
    const { dir, dirs } = this;
    const paths: string[] = [dirs.dist.value];
    if (withDepsAndCache) {
      paths.push(dir.join('node_modules').value, dir.join('.turbo').value);
    }
    return rmrf(...paths);
  }

  async preparePackageJSON() {
    const { exports, json, project } = this;
    const _exports: Record<string, any> = {};
    const typesVersions: Record<string, any> = {};
    let main: string | undefined;
    let mainTypes: string | undefined;

    exports.forEach(({ id, at }) => {
      const _at = extractWorkspaceObjectExport(at);
      _exports[id] = _at;
      if (typeof _at !== 'object') return;
      const isMainExport = id === '.';
      const trimmedId = isMainExport ? id : id.replace(/^\.\//, '');
      typesVersions[trimmedId] = [_at.types];

      if (isMainExport) {
        main = _at.import.default;
        mainTypes = _at.types;
      }
    });

    if (json.exports) {
      const entries = Object.entries(json.exports);
      entries.forEach(([id, at]) => {
        const types = Object.keys(at!);
        if (types.length === 1 && types[0] === 'types') {
          _exports[id] = at;
        }
      });
    }

    _exports['./*'] = './dist/*';

    const originalJSONString = JSON.stringify(json);
    const cloned: typeof json = JSON.parse(originalJSONString);
    cloned.exports = _exports;
    cloned.typesVersions = {
      '*': typesVersions,
    };
    if (main) cloned.main = main;
    if (mainTypes) cloned.types = mainTypes;

    // delete cloned.main;
    // delete cloned.types;
    // delete cloned.typesVersions;

    const projectPeerDependencies = project?.config.peerDependencies;
    (['dependencies', 'devDependencies', 'peerDependencies'] as const).forEach(
      (prop) => {
        const deps = cloned[prop];
        if (!deps) return;
        Object.keys(deps).forEach((dep) => {
          const version = deps[dep];
          if (version.startsWith(WORKSPACE_SPEC_PREFIX)) {
            deps[dep] = `${WORKSPACE_SPEC_PREFIX}^`;
          } else if (projectPeerDependencies && projectPeerDependencies[dep]) {
            deps[dep] = projectPeerDependencies[dep];
          }
        });
      },
    );

    cloned.files = cloned.files || [];
    if (!cloned.files.some((file) => /(\.\/)?dist\/?/.test(file))) {
      cloned.files.unshift('dist');
    }

    if (project) {
      syncWorkspacePackageFields(project.json, cloned);
    }

    cloned.type = cloned.type || 'module';

    await this.hooks.preparePackageJSON(json, this);

    const sorted = sortPackageJson(cloned);
    const toStr = JSON.stringify(sorted, null, 2);
    if (originalJSONString !== toStr) {
      await fs.writeFile(this.dir.join(PACKAGE_JSON_FILENAME).value, toStr);
      this._json = sorted;
    }
    return sorted;
  }

  getStubLinks(): WorkspaceStubLink[] {
    const links: WorkspaceStubLink[] = [];
    this.exports.forEach(({ stubLink }) => {
      stubLink && links.push(stubLink);
    });
    return links;
  }

  async stub() {
    await this.clean();
    await fs.mkdir(this.dirs.dist.value);
    return this.builder.stub();
  }

  async getESBuildPlugins(): Promise<ESBuildPlugin[]> {
    const results: ESBuildPlugin[] = [];
    results.push({
      name: 'plugboy-workspace-env',
      setup: (build) => {
        const isJS = /\.m?js$/;
        const RELATIVE_PATH_FOR_WORKSPACE =
          '@@__PLUGBOY_RELATIVE_PATH_FOR_WORKSPACE__';
        const encoder = new TextEncoder();

        build.onEnd(({ outputFiles, errors, warnings }) => {
          const result = { errors, warnings };
          if (!outputFiles || !outputFiles.length || errors.length)
            return result;

          for (const file of outputFiles) {
            const { path: filePath, text } = file;
            if (
              !isJS.test(filePath) ||
              !text.includes(RELATIVE_PATH_FOR_WORKSPACE)
            ) {
              continue;
            }
            const relativePath = path.relative(
              path.dirname(filePath),
              this.dir.value,
            );
            const content = text.replace(
              RELATIVE_PATH_FOR_WORKSPACE,
              relativePath,
            );
            file.contents = encoder.encode(content);
          }

          return result;
        });
      },
    });
    const { plugins } = this;
    for (const plugin of plugins) {
      const { esbuildPlugins } = plugin;
      if (!esbuildPlugins) continue;
      for (const chunk of esbuildPlugins) {
        const esbuildPlugin =
          // eslint-disable-next-line no-await-in-loop
          typeof chunk === 'function' ? await chunk(this) : await chunk;
        if (esbuildPlugin) {
          results.push(esbuildPlugin);
        }
      }
    }
    return results;
  }

  async build() {
    await this.clean();
    return this.builder.build();
  }
}

export async function getWorkspace<
  AllowMissing extends boolean | undefined = false,
>(
  searchDir?: string,
  allowMissing?: AllowMissing,
): Promise<
  AllowMissing extends true ? PlugboyWorkspace | null : PlugboyWorkspace
> {
  const hit = await getWorkspacePackageJson(searchDir, allowMissing);
  if (!hit) {
    return null as any;
  }
  const { dir, json } = hit;
  const config = await loadWorkspaceConfig(dir.value, 0);

  const project = await getProject(dir.value, true, config.ignoreProjectConfig);

  const dirs: WorkspaceDirs = {
    src: dir.join('src'),
    dist: dir.join('dist'),
  };

  const { dependencies, peerDependencies, optionalDependencies } = json;
  const allDeps = {
    ...dependencies,
    ...peerDependencies,
    ...optionalDependencies,
  };

  const _dependencies = Object.keys(allDeps);

  const projectDependencies = Object.entries(allDeps)
    .filter(([dep, spec]) => spec.startsWith(WORKSPACE_SPEC_PREFIX))
    .map(([dep]) => dep);

  const meta: WorkspaceMeta = {};

  const packagePlugins = project?.plugins || [];
  const packageHooks = project?.hooks || [];
  const plugins: Plugin[] = [...packagePlugins, ...config.plugins];
  const _hooks: UserHooks[] = [...packageHooks];
  if (config.hooks) {
    _hooks.push(config.hooks);
  }
  const resolvedHooks = await resolveUserHooks(..._hooks);
  const hooks = buildHooks(resolvedHooks);

  const dts = mergeDTSSettingsList(project?.config.dts, config.dts);

  let { optimizeCSS } = config;
  if (optimizeCSS !== false && project && project.config.optimizeCSS) {
    optimizeCSS = {
      ...project.config.optimizeCSS,
      ...optimizeCSS,
    };
  }

  const ctx: WorkspaceSetupContext = {
    dir,
    json,
    config,
    project,
    dirs,
    dependencies: _dependencies,
    projectDependencies,
    meta,
    plugins,
    hooks,
    dts,
    optimizeCSS,
  };

  await hooks.setupWorkspace(ctx);

  const workspace = new PlugboyWorkspace(ctx);

  await hooks.createWorkspace(workspace);

  return workspace;
}

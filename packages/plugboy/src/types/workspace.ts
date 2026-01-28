import type { UserConfig as TSDownConfig } from 'tsdown';
import type { Path } from '../path';
import { RequiredPackageJSON, MarkRequired } from './_utils';
import type { PlugboyProject } from '../project';
import type { UserPluginOption, Plugin } from './plugin';
import type { BuildedHooks, UserHooks } from './hook';
import { DTSSettings, NormalizedDTSSettings } from './dts';
import { OptimizeCSSOptions } from './css';
import { type ExternalOption } from 'rolldown';
import { type NoExternalOption } from './tsdown';

export const WORKSPACE_REQUIRED_FIELDS = ['name', 'version'] as const;

type WorkspaceRequiredField = (typeof WORKSPACE_REQUIRED_FIELDS)[number];

/**
 * Entry setting object
 */
export interface RawWorkspaceEntryObject {
  /**
   * Entry file path
   * @remarks It must be relative to the root directory of the workspace.
   */
  src: string;
  /**
   * Set to true if the entry outputs css at the same time
   * @remarks By doing this, the exports field in package.json will be set automatically.
   */
  css?: boolean;
}

/**
 * Entry setting object
 */
export type WorkspaceEntry = MarkRequired<
  RawWorkspaceEntryObject,
  'src' | 'css'
>;

export type RawWorkspaceEntry = string | RawWorkspaceEntryObject;

/**
 * Configuration of all entries in the workspace (normalized)
 *
 * @see {@link RawWorkspaceEntries}
 */
export type WorkspaceEntries = Record<string, WorkspaceEntry>;

/**
 * Configuration of all entries in the workspace
 *
 * @remarks The configuration must be `{ [id]: [Entry setting: }`. `"." ` is treated as a special ID and is the target of the main export.
 */
export type RawWorkspaceEntries = Record<string, RawWorkspaceEntry>;

export const TSDOWN_SYNC_OPTIONS = [
  'define',
  'noExternal',
  'external',
  'skipNodeModulesBundle',
  'onSuccess',
  'copy',
] as const satisfies (keyof TSDownConfig)[];

type TSDownSyncOption = (typeof TSDOWN_SYNC_OPTIONS)[number];

interface TSDownSyncOptions extends Pick<TSDownConfig, TSDownSyncOption> {}

/**
 * Workspace User Configuration
 */
export interface UserWorkspaceConfig extends TSDownSyncOptions {
  /**
   * Ignore project settings
   *
   * @remarks Normally, when processing a workspace, plugboy looks for and merges the settings of the entire project at the same time, but this action can be canceled.
   */
  ignoreProjectConfig?: boolean;
  /**
   * Configuration of all entries in the workspace
   *
   * @see {@link RawWorkspaceEntries}
   */
  entries?: RawWorkspaceEntries;
  /**
   * Hook Setting
   * @see {@link UserHooks}
   */
  hooks?: UserHooks;
  /**
   * Plug-in List
   * @see {@link UserPluginOption}
   */
  plugins?: UserPluginOption[];
  /**
   * declaration output setting
   * @see {@link DTSSettings}
   */
  dts?: DTSSettings;
  /**
   * CSS optimization options
   *
   * Disable the operation with `false`.
   *
   * @default true
   *
   * @see {@link OptimizeCSSOptions}
   */
  optimizeCSS?: OptimizeCSSOptions | boolean;
}

/**
 * Workspace Configuration
 */
export interface ResolvedWorkspaceConfig
  extends Required<
      Omit<
        UserWorkspaceConfig,
        | 'entries'
        | 'hooks'
        | 'plugins'
        | 'dts'
        | 'optimizeCSS'
        | TSDownSyncOption
      >
    >,
    TSDownSyncOptions {
  /**
   * Configuration of all entries in the workspace
   *
   * @see {@link WorkspaceEntries}
   */
  entries: WorkspaceEntries;
  /**
   * Hook Setting
   * @see {@link UserHooks}
   */
  hooks?: UserHooks;
  /**
   * Plug-in List
   * @see {@link UserPluginOption}
   */
  plugins: Plugin[];
  /**
   * declaration output setting
   * @see {@link DTSSettings}
   */
  dts?: DTSSettings;
  /**
   * CSS optimization options
   *
   * Disable the operation with `false`.
   *
   * @see {@link OptimizeCSSOptions}
   */
  optimizeCSS: OptimizeCSSOptions | false;
}

export type WorkspacePackageJson = RequiredPackageJSON<WorkspaceRequiredField>;

/**
 * Workspace Directory Settings
 */
export interface WorkspaceDirs {
  /** Path instance of the source directory */
  src: Path;
  /** Path instance of the distribution directory */
  dist: Path;
}

/**
 * Workspace Meta Information
 *
 * @remarks This will be set to a value uniquely extended by the plugin
 */

export interface WorkspaceMeta {}

/**
 * Workspace setup context object
 * @remarks Objects that are configured when the workspace is set up. Customization can be done before the workspace instance is created by a plug-in or other process.
 */
export interface WorkspaceSetupContext {
  /** Workspace directory path instance */
  dir: Path;
  /** package.json */
  json: WorkspacePackageJson;
  /**
   * Workspace Configuration
   * @see {@link ResolvedWorkspaceConfig}
   */
  config: ResolvedWorkspaceConfig;
  /** Plugboy Project */
  project: PlugboyProject | null;
  /** Workspace Directory Settings */
  dirs: WorkspaceDirs;
  /**
   * All package names on which the workspace depends
   */
  dependencies: string[];
  /**
   * Names of all in-project packages on which the workspace depends
   */
  projectDependencies: string[];
  /**
   * Workspace Meta Information
   * @see {@link WorkspaceMeta}
   */
  meta: WorkspaceMeta;
  /**
   * プラグインリスト
   * @see {@link Plugin}
   */
  plugins: Plugin[];
  /**
   * Map of hook methods that can be initialized and called
   * @see {@link BuildedHooks}
   */
  hooks: BuildedHooks;
  /**
   * declaration output setting
   * @see {@link NormalizedDTSSettings}
   */
  dts: NormalizedDTSSettings;
  /**
   * CSS optimization options
   *
   * Disable the operation with `false`.
   *
   * @see {@link OptimizeCSSOptions}
   */
  optimizeCSS: OptimizeCSSOptions | false;
  // @TODO JSDoc
  mergeExternals(override: ExternalOption): void;
  // @TODO JSDoc
  mergeNoExternals(override: NoExternalOption): void;
}

import type { Path } from '../path';
import { RequiredPackageJSON, MarkRequired } from './_utils';
import type { PlugboyProject } from '../project';
import type { UserPluginOption, Plugin } from './plugin';
import type { UserHooks, BuildedHooks } from './hook';
import { Options as TSUpOptions } from 'tsup';
import { DTSSettings, NormalizedDTSSettings } from './dts';

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

export const TSUP_SYNC_OPTIONS = [
  'define',
  'noExternal',
  'external',
  'replaceNodeEnv',
  'skipNodeModulesBundle',
] as const;

type TSUpSyncOption = (typeof TSUP_SYNC_OPTIONS)[number];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TSUpSyncOptions extends Pick<TSUpOptions, TSUpSyncOption> {}

/**
 * Workspace User Configuration
 */
export interface UserWorkspaceConfig extends TSUpSyncOptions {
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
   * d.ts output setting
   * @see {@link DTSSettings}
   */
  dts?: DTSSettings;
}

/**
 * Workspace Configuration
 */
export interface ResolvedWorkspaceConfig
  extends Required<
      Omit<
        UserWorkspaceConfig,
        'entries' | 'hooks' | 'plugins' | 'dts' | TSUpSyncOption
      >
    >,
    TSUpSyncOptions {
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
   * d.ts output setting
   * @see {@link DTSSettings}
   */
  dts?: DTSSettings;
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
   * d.ts output setting
   * @see {@link NormalizedDTSSettings}
   */
  dts: NormalizedDTSSettings;
}

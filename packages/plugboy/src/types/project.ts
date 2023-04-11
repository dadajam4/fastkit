import { RequiredPackageJSON } from './_utils';
import type { CompilerOptions } from 'typescript';
import { WorkspacePackageJson } from './workspace';
import { UserPluginOption, Plugin } from './plugin';
import type { Path } from '../path';
import { UserHooks } from './hook';
import { DTSSettings } from './dts';

export const PROJECT_REQUIRED_FIELDS = ['name'] as const;

type ProjectRequiredField = (typeof PROJECT_REQUIRED_FIELDS)[number];

export type TSConfigJSON = {
  compilerOptions?: CompilerOptions;
} & Record<string, any>;

/**
 * Template for package.json script in workspace
 */
export interface ProjectScriptsTemplate {
  /** Template Name */
  name: string;
  /** Script Map */
  scripts: Record<string, string>;
}

/**
 * Project User Configuration
 */
export interface UserProjectConfig {
  /**
   * Directory where the workspace is located
   * @remarks Used to create a new workspace with the `plugboy gen` CLI command.
   * @default packages
   */
  workspacesDir?: string;
  /**
   * Workspace script templates, or a list of them
   * @remarks Used to create a new workspace with the `plugboy gen` CLI command.
   */
  scripts?: Record<string, string> | ProjectScriptsTemplate[];
  /**
   * Workspace tsconfig template
   * @remarks Used to create a new workspace with the `plugboy gen` CLI command.
   */
  tsconfig?: TSConfigJSON;
  /**
   * Workspace README template
   * @remarks Used to create a new workspace with the `plugboy gen` CLI command.
   */
  readme?: (json: WorkspacePackageJson) => string;
  /**
   * Fixes the version of all peer dependencies in the project
   */
  peerDependencies?: Record<string, string>;
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
 * Project Configuration
 */

export interface ResolvedProjectConfig
  extends Required<
    Omit<
      UserProjectConfig,
      'scripts' | 'tsconfig' | 'hooks' | 'plugins' | 'dts'
    >
  > {
  /**
   * Workspace script templates list
   * @remarks Used to create a new workspace with the `plugboy gen` CLI command.
   */
  scripts: ProjectScriptsTemplate[];
  /**
   * Workspace tsconfig template
   * @remarks Used to create a new workspace with the `plugboy gen` CLI command.
   */
  tsconfig?: TSConfigJSON;
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

export type ProjectPackageJson = RequiredPackageJSON<ProjectRequiredField>;

/**
 * Project setup context object
 * @remarks Objects that are configured when the project is set up.
 */
export interface ProjectSetupContext {
  /** Project directory path instance */
  dir: Path;
  /** package.json */
  json: ProjectPackageJson;
  /** Project Configuration */
  config: ResolvedProjectConfig;
  /**
   * List of directory names of workspaces located in the project
   * @remarks Note that it is the directory name, not the package name.
   */
  resolvedWorkspaces: string[];
}

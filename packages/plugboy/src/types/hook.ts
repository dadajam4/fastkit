import type { Listable } from '../utils';
import { WorkspaceSetupContext, WorkspacePackageJson } from './workspace';
import type { PlugboyWorkspace, Builder } from '../workspace';
import type { OutputFile } from 'esbuild';

/** plugboy hook definition */
export interface HookTypes {
  /**
   * Hooks during workspace setup
   * @remarks Called just before the workspace instance is created
   * @param ctx - {@link WorkspaceSetupContext Workspace setup context object}
   */
  setupWorkspace: (ctx: WorkspaceSetupContext) => any;
  /**
   * Hooks after workspace generation
   * @param workspace - {@link PlugboyWorkspace workspace instance}
   */
  createWorkspace: (workspace: PlugboyWorkspace) => any;
  /**
   * Hooks when correcting package.json
   * @param json - package.json just before it was modified and saved by the plugboy
   * @param workspace - {@link PlugboyWorkspace workspace instance}
   */
  preparePackageJSON: (
    json: WorkspacePackageJson,
    workspace: PlugboyWorkspace,
  ) => any;
  /**
   * Hooks when successful build
   * @param builder - Builder
   * @param outputFiles - List of output files
   *
   * @note
   * The text information contained in outputFiles may have already been rewritten by plugboy and output as files.
   * If you wish to perform text replacement, etc., be sure to do so on the read file.
   *
   * @see {@link OutputFile}
   */
  onSuccess: (builder: Builder, outputFiles: OutputFile[]) => any;
}

export function createHooksDefaults(): ResolvedHooks {
  return {
    setupWorkspace: [],
    createWorkspace: [],
    preparePackageJSON: [],
    onSuccess: [],
  };
}

export type HookName = keyof HookTypes;

/**
 * plugboy user hook definition
 * @see {@link HookTypes}
 */
export type UserHooks = {
  [Name in HookName]?: Listable<HookTypes[Name]>;
};

/**
 * Pre-setup hook definitions
 * @see {@link HookTypes}
 */
export type ResolvedHooks = {
  [Name in HookName]: HookTypes[Name][];
};

export type HookArgs<Name extends HookName> = Parameters<HookTypes[Name]>;

export type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export type HookReturnType<Name extends HookName> = UnPromisify<
  ReturnType<HookTypes[Name]>
>;

/**
 * Map of hook methods that can be initialized and called
 * @see {@link HookTypes}
 */
export type BuildedHooks = {
  [Name in HookName]: (
    ...args: HookArgs<Name>
  ) => Promise<HookReturnType<Name>>;
};

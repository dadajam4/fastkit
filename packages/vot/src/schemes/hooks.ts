import type { Router, RouterOptions } from 'vue-router';
import type { UnPromisify } from '@fastkit/helpers';

export type VotBeforeRouterSetupParams = RouterOptions;

export type VotBeforeRouterSetupHook = (
  args: VotBeforeRouterSetupParams,
) => any;

export type VotAfterRouterSetupParams = Router;

export type VotAfterRouterSetupHook = (args: VotAfterRouterSetupParams) => any;

export interface VotHookTypes {
  beforeRouterSetup: VotBeforeRouterSetupHook;
  afterRouterSetup: VotAfterRouterSetupHook;
}

export type VotHookName = keyof VotHookTypes;

export type VotHookFn<Name extends VotHookName> = VotHookTypes[Name];

export type SetupedVotHooks = {
  [Name in VotHookName]: VotHookFn<Name>[];
};

export type VotHooksSettings = {
  [Name in VotHookName]?: VotHookFn<Name> | VotHookFn<Name>[];
};

export interface VotPluginHooksChunk {
  hooks?: VotHooksSettings;
}

function isVotPluginHooksChunk(source: any): source is VotPluginHooksChunk {
  return 'hooks' in source;
}

export type VotHooksSettingsChunk = VotHooksSettings | VotPluginHooksChunk;

export type VotHooksSettingsSource =
  | VotHooksSettingsChunk
  | VotHooksSettingsChunk[];

export function setupVotHooks(source: VotHooksSettingsSource): SetupedVotHooks {
  const hooks: SetupedVotHooks = {
    beforeRouterSetup: [],
    afterRouterSetup: [],
  };
  const chunks = Array.isArray(source) ? source : [source];
  for (const chunk of chunks) {
    const settings = isVotPluginHooksChunk(chunk) ? chunk.hooks : chunk;
    if (!settings) continue;
    const entries = Object.entries(settings);
    for (const [name, value] of entries) {
      const bucket: any[] = (hooks as any)[name];
      if (!bucket) continue;
      Array.isArray(value) ? bucket.push(...value) : bucket.push(value);
    }
  }
  return hooks;
}

export class VotHooks {
  private _hooks: SetupedVotHooks;

  constructor(source: VotHooksSettingsSource) {
    this._hooks = setupVotHooks(source);
  }

  async emit<Name extends VotHookName>(
    name: Name,
    ...args: Parameters<VotHookFn<Name>>
  ): Promise<UnPromisify<ReturnType<VotHookFn<Name>>>[]> {
    const payloads: UnPromisify<ReturnType<VotHookFn<Name>>>[] = [];
    const fns = this._hooks[name];
    for (const fn of fns) {
      payloads.push(await (fn as any)(...args));
    }
    return payloads;
  }

  add<Name extends VotHookName>(name: Name, fn: VotHookFn<Name>) {
    this._hooks[name].push(fn);
    return () => this.remove(name, fn);
  }

  remove<Name extends VotHookName>(name: Name, fn: VotHookFn<Name>) {
    (this._hooks as any)[name] = this._hooks[name].filter(
      (target) => target !== fn,
    );
  }
}

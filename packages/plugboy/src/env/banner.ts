import { type InlineConfig } from 'tsdown';
import type { PlugboyEnvVarName } from './types';

export function applyPlugboyEnvs(
  config: Pick<InlineConfig, 'define' | 'banner'>,
) {
  const PLUGBOY_VAR_ENVS: Record<PlugboyEnvVarName, string> = {
    __PLUGBOY_STUB__: 'false',
  };

  const DEFINE_VAR_INJECTS = Object.fromEntries(
    Object.keys(PLUGBOY_VAR_ENVS).map((envName) => [envName, `$$${envName}`]),
  );

  config.define = {
    ...config.define,
    ...DEFINE_VAR_INJECTS,
  };
}

export function getPlugboyEnvCodeForStub() {
  const PLUGBOY_ENVS: Record<PlugboyEnvVarName, string> = {
    __PLUGBOY_STUB__: 'true',
  };
  return Object.entries(PLUGBOY_ENVS)
    .map(([envName, variable]) => `globalThis.${envName} = ${variable};`)
    .join('\n');
}

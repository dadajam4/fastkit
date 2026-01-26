import { type InlineConfig } from 'tsdown';
import {
  PLUGBOY_VAR_ENVS_FOR_BUNDLE,
  PLUGBOY_VAR_ENVS_FOR_STUB,
} from './constants';

export function applyPlugboyEnvs(
  config: Pick<InlineConfig, 'define' | 'banner'>,
) {
  const DEFINE_VAR_INJECTS = Object.fromEntries(
    Object.entries(PLUGBOY_VAR_ENVS_FOR_BUNDLE).map(([envName, value]) => {
      const _value = value.startsWith('#') ? `$$${envName}` : value;
      return [envName, _value];
    }),
  );

  config.define = {
    ...config.define,
    ...DEFINE_VAR_INJECTS,
  };
}

export function getPlugboyEnvCodeForStub() {
  return Object.entries(PLUGBOY_VAR_ENVS_FOR_STUB)
    .map(([envName, variable]) => `globalThis.${envName} = ${variable};`)
    .join('\n');
}

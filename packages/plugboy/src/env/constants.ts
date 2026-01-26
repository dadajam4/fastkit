import type { PlugboyEnvVarName } from './types';

// Values starting with "#" have the "#" stripped and are transformed so that
// references like import.meta.env are not removed by rolldown during bundling.
export const PLUGBOY_VAR_ENVS_FOR_BUNDLE: Record<PlugboyEnvVarName, string> = {
  __PLUGBOY_STUB__: 'false',
  __PLUGBOY_DEV__: `#(typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') || (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true)`,
};

export const PLUGBOY_VAR_ENVS_FOR_STUB: Record<PlugboyEnvVarName, string> = {
  __PLUGBOY_STUB__: 'true',
  __PLUGBOY_DEV__: 'true',
};

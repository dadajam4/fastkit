import { Options } from 'tsup';

type ESBuildPluginType = NonNullable<Options['esbuildPlugins']>[number];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ESBuildPlugin extends ESBuildPluginType {}

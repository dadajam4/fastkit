import { Options } from 'tsup';

type ESBuildPluginType = NonNullable<Options['esbuildPlugins']>[number];

export interface ESBuildPlugin extends ESBuildPluginType {}

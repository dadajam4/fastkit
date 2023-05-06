import { defineLayerStyle } from '@fastkit/plugboy-vanilla-extract-plugin/css';

export const framework = defineLayerStyle({ globalName: 'vue-app-layout' });

export const base = framework.defineNestedLayer({ globalName: 'base' });

export const component = framework.defineNestedLayer({
  globalName: 'component',
});

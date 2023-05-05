import { defineLayerStyle } from '@fastkit/plugboy-vanilla-extract-plugin/css';

export const framework = defineLayerStyle('vue-app-layout');

export const base = framework.defineNestedLayer('base');

export const component = framework.defineNestedLayer('component');

import type { Plugin as VitePlugin } from 'vite';
import { findProjectPlugin } from '@fastkit/plugboy';
import Vue from '@vitejs/plugin-vue';
import { PLUGIN_NAME, VuePlugin } from './types';

export async function ViteVueJSXPlugin(): Promise<VitePlugin> {
  const plugin = await findProjectPlugin<VuePlugin>(PLUGIN_NAME);
  return Vue(plugin?._options) as VitePlugin;
}

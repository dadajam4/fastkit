import type { Plugin as VitePlugin } from 'vite';
import { findProjectPlugin } from '@fastkit/plugboy';
import JSX from '@vitejs/plugin-vue-jsx';
import { PLUGIN_NAME, VueJSXPlugin } from './types';

export async function ViteVueJSXPlugin(): Promise<VitePlugin> {
  const plugin = await findProjectPlugin<VueJSXPlugin>(PLUGIN_NAME);
  return JSX(plugin?._options) as VitePlugin;
}

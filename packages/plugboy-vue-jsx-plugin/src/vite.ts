import { Plugin as VitePlugin } from 'vite';
import { PLUGIN_NAME, VueJSXPlugin } from './types';
import { findProjectPlugin } from '@fastkit/plugboy';
import JSX from '@vitejs/plugin-vue-jsx';

export async function ViteVueJSXPlugin(): Promise<VitePlugin> {
  const plugin = await findProjectPlugin<VueJSXPlugin>(PLUGIN_NAME);
  return JSX(plugin?.options.jsx);
}

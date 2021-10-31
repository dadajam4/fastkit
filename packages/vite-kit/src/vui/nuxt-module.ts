import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit';
import {
  ViteVuiPlugin,
  ViteVuiPluginOptions,
  ViteVuiPluginResultSettings,
} from './vite-plugin';
import { ViteKitError } from '../logger';
import { render } from 'eta';
import path from 'path';
import fs from 'fs-extra';

const TEMPLATE = `
/* eslint-disable */
// @ts-nocheck
import { defineNuxtPlugin } from '#app';
import { installVuiPlugin } from '@fastkit/vui';
import { colorScheme } from '<%~ it.colorScheme %>';
import '<%~ it.mediaMatch %>';

export const VuiPlugin = defineNuxtPlugin(nuxt => {
  installVuiPlugin(nuxt.vueApp, {
    colorScheme,
    colors: <%~ it.colors %>,
    icons: <%~ it.icons %>,
  });
});

export default VuiPlugin;
`.trim();

async function renderTemplate({
  colorScheme,
  mediaMatch,
  colors,
  icons,
}: ViteVuiPluginResultSettings) {
  const result = await render(
    TEMPLATE,
    {
      colorScheme,
      mediaMatch,
      colors: JSON.stringify(colors),
      icons: JSON.stringify(icons),
    },
    { async: true },
  );
  if (!result) {
    throw new ViteKitError('template render error.');
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VuiModuleOptions extends ViteVuiPluginOptions {}

export const VuiModule = defineNuxtModule<VuiModuleOptions>({
  async setup(options, nuxt) {
    const { options: nuxtOptions } = nuxt;
    nuxtOptions.build.transpile.push(/imask/);
    let vite = nuxtOptions.vite;

    if (vite === false) {
      throw new ViteKitError(`vui needs vite.`);
    }

    if (!vite || vite === true) {
      vite = {};
    }

    vite.plugins = vite.plugins || [];

    const { iconFontDefaults } = options;

    const { plugins, settings, dest } = await ViteVuiPlugin({
      ...options,
      iconFontDefaults: {
        // @TODO url() import was broken...
        absolutePath: true,
        ...iconFontDefaults,
      },
    });
    vite.plugins.push(...plugins);
    nuxtOptions.vite = vite;

    nuxtOptions.css.push(
      `@fastkit/vue-stack/dist/vue-stack.css`,
      `@fastkit/vue-app-layout/dist/vue-app-layout.css`,
      path.join(dest, 'icon-font/index.css'),
      `@fastkit/vui/dist/vui.css`,
      path.join(dest, 'setup.scss'),
    );

    if (options.__dev) {
      const destPath = path.resolve(
        __dirname,
        '../../_docs/src/.vui',
        'nuxt-vui-plugin.ts',
      );
      fs.writeFile(
        destPath,
        // path.join(dest, 'vui-installer.ts'),
        await renderTemplate(settings),
      );
    } else {
      addPluginTemplate({
        src: '',
        filename: 'nuxt-vui-plugin.ts',
        getContents: (data) => renderTemplate(settings),
        write: true,
      });
    }
  },
});

export function useVuiModule(options?: VuiModuleOptions) {
  return [VuiModule, options];
}

export default VuiModule;

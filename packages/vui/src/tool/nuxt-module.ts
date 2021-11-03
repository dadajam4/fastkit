import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit';
import {
  viteVuiPlugin,
  ViteVuiPluginOptions,
  ViteVuiPluginResultSettings,
} from './vite-plugin';
import { VuiError } from '../logger';
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
    throw new VuiError('template render error.');
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NuxtVuiModuleOptions extends ViteVuiPluginOptions {}

export const NuxtVuiModule = defineNuxtModule<NuxtVuiModuleOptions>({
  async setup(options, nuxt) {
    const { options: nuxtOptions } = nuxt;
    nuxtOptions.build.transpile.push(/imask/);
    let vite = nuxtOptions.vite;

    if (vite === false) {
      throw new VuiError(`vui needs vite.`);
    }

    if (!vite || vite === true) {
      vite = {};
    }

    vite.plugins = vite.plugins || [];

    const { iconFontDefaults } = options;

    const { plugins, settings, dest } = await viteVuiPlugin({
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
        '../../../../docs/.vui',
        'nuxt-vui-plugin.ts',
      );
      await fs.ensureDir(path.dirname(destPath));
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

export function useNuxtVuiModule(options?: NuxtVuiModuleOptions) {
  return [NuxtVuiModule, options];
}

export default NuxtVuiModule;

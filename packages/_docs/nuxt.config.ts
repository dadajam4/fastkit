import { defineNuxtConfig } from 'nuxt3';

import { useVuiModule } from '@fastkit/vui/dist/tool';

const config = defineNuxtConfig({
  srcDir: './src',
  modules: [useVuiModule({ __dev: true })],
  plugins: ['~/.vui/nuxt-vui-plugin.ts'],
  meta: {
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
    ],
    link: [
      {
        rel: 'icon',
        href: '/logo.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'mask-icon',
        href: '/safari-pinned-tab.svg',
        color: '#00aba9',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
      },
    ],
  },
});

export default config;

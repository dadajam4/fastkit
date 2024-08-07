import { createVotEntry } from '@fastkit/vot';
import { LocaleLink, useLink } from '@fastkit/vue-i18n';
import type { VuiService } from '@fastkit/vui';
import { installSortableDirective } from '@fastkit/vue-sortable';
import { installVui } from '../.vui/installer';
import { App } from './App';
import { i18n, pmScriptPlugin } from '@@';
import { VErrorPage } from './components/VErrorPage/VErrorPage';

import '~/main.scss';
import '~/main.css';

declare module '@fastkit/vue-page' {
  interface VuePageControl {
    $vui: VuiService;
  }
}

export default createVotEntry(App, {
  ErrorComponent: VErrorPage,
  routerOptions: {
    RouterLink: LocaleLink,
    useLink,
  },
  plugins: [
    (ctx) => {
      installVui(ctx, {
        RouterLink: ctx.RouterLink,
        useLink: ctx.useLink,
        uiSettings: {
          noDataMessage: 'データはありませんでした。',
          noResultsMessage: '検索結果が見つかりませんでした。',
        },
      });
      installSortableDirective(ctx.app);
      (ctx as any).$vui = ctx.app.config.globalProperties.$vui;
    },
    pmScriptPlugin,
    i18n,
  ],
  middleware: [
    async (ctx) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (ctx.to?.path === '/page2') {
        // ctx.redirect({ path: 'https://hoge.com' });
        ctx.redirect({ path: '/page3' });
      }
      // console.log(ctx.to);
      // ctx.redirect({ path: 'https://hoge.com' });
    },
  ],
});

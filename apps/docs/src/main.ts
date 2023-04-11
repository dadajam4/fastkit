import { createVotEntry } from '@fastkit/vot';
import { installVui } from '../.vui/installer';
import { App } from './App';
import { i18n } from '@@';
import { VErrorPage } from './components/VErrorPage/VErrorPage';
import { LocaleLink, useLink } from '@fastkit/vue-i18n';

import './main.scss';
import './main.css';

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
    },
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

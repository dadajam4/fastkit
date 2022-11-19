import './main.scss';
import { App } from './App';
import { installVui } from '../.vui/installer';
import { createVotEntry } from '@fastkit/vot';
import { authPlugin } from './plugins';
import { i18nPlugin } from '~/i18n';
import { VErrorPage } from './components/VErrorPage/VErrorPage';

export default createVotEntry(App, {
  ErrorComponent: VErrorPage,
  plugins: [
    (ctx) => {
      installVui(ctx, {
        uiSettings: {
          noDataMessage: 'データはありませんでした。',
          noResultsMessage: '検索結果が見つかりませんでした。',
        },
      });
    },
    i18nPlugin,
    authPlugin,
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

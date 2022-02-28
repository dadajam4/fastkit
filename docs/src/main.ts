import './main.scss';

import { App } from './App';
import { installVui } from '../.vui/installer';
import { createVotEntry } from '@fastkit/vot';
import { authPlugin } from './plugins';

export default createVotEntry(App, {
  plugins: [
    (ctx) => {
      installVui(ctx, {
        uiSettings: {
          noDataMessage: 'データはありませんでした。',
          noResultsMessage: '検索結果が見つかりませんでした。',
        },
      });
    },
    authPlugin,
  ],
  // middleware: [
  //   async (ctx) => {
  //     await new Promise((resolve) => setTimeout(resolve, 100));
  //     if (ctx.to?.path === '/page2') {
  //       // ctx.redirect({ path: 'https://hoge.com' });
  //       ctx.redirect({ path: '/page3' });
  //     }
  //     // console.log(ctx.to);
  //     // ctx.redirect({ path: 'https://hoge.com' });
  //   },
  // ],
});

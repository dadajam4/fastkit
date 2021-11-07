import './main.scss';

import { App } from './App';
import { installVui } from '../.vui/installer';
import { createViteRunaEntry } from '@fastkit/vite-runa';
import routes from 'virtual:generated-pages';

export default createViteRunaEntry(App, {
  routes,
  plugins: [
    (ctx) => {
      installVui(ctx.app);
    },
  ],
});

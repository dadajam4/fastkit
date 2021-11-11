import './main.scss';

import { App } from './App';
import { installVui } from '../.vui/installer';
import { createViteRunaEntry } from '@fastkit/vite-runa';

export default createViteRunaEntry(App, {
  plugins: [
    (ctx) => {
      installVui(ctx.app);
    },
  ],
});

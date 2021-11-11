import './main.scss';

import { App } from './App';
import { installVui } from '../.vui/installer';
import { createVotEntry } from '@fastkit/vot';

export default createVotEntry(App, {
  plugins: [
    (ctx) => {
      installVui(ctx.app);
    },
  ],
});

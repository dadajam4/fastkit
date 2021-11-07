import './main.scss';

import { App } from './App';
import { installVui } from '../.vui/installer';
import { createVitePageRenderer } from '@fastkit/vite-page';
import routes from 'virtual:generated-pages';

export default createVitePageRenderer(App, {
  routes,
  plugins: [
    (ctx) => {
      // console.log(ctx.router.options.routes);
      // console.log('★', typeof window);
      // const hoge = useRouter();
      // console.log(ctx.router.options);
      installVui(ctx.app);
    },
  ],
});

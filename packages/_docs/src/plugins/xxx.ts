// import type { Router } from 'vue-router';
// import {
//   getSuspenseRouteBucket,
//   createScrollBehavior,
// } from '@fastkit/vue-utils';
import { nuxtScrollBehaviorPlugin } from '../../../nuxt-utils/src';

export default defineNuxtPlugin((nuxt) => {
  nuxtScrollBehaviorPlugin(nuxt);
  // const router = nuxt.$router as Router;
  // const { options } = router;
  // const bucket = getSuspenseRouteBucket();
  // if (process.client && !options.scrollBehavior) {
  //   nuxt.hook('page:start', bucket.push);
  //   nuxt.hook('page:finish', bucket.remove);
  //   options.scrollBehavior = createScrollBehavior();
  // }
});

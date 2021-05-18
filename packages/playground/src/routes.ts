import { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./pages/Home'),
    props: true,
  },
  {
    path: '/page2',
    component: () => import('./pages/Page2'),
    props: true,
  },
];

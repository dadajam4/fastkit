import {
  createVotPlugin,
  VuePageControl,
  StateInjectionKey,
} from '@fastkit/vot';
import { InjectionKey, inject } from 'vue';
// import { objectHash } from '@fastkit/helpers';

// declare module '@fastkit/vue-page' {
//   interface VuePageControl {
//     auth: AuthSearvice;
//   }
// }

const AuthStateInjectionKey: StateInjectionKey<AuthState> = '__auth-state__';
const AuthSearviceInjectionKey: InjectionKey<AuthSearvice> = Symbol();

export class AuthSearvice {
  static readonly InjectionKey = AuthSearviceInjectionKey;
  static readonly StateInjectionKey = AuthStateInjectionKey;

  static use() {
    const auth = inject(AuthSearviceInjectionKey);
    if (!auth) {
      throw new Error('missing auth service');
    }
    return auth;
  }

  readonly ctx: VuePageControl;
  readonly state: AuthState;

  get isLoggedIn() {
    return !!this.state.me;
  }

  constructor(ctx: VuePageControl, state: AuthState) {
    this.ctx = ctx;
    this.state = state;

    if (ctx.isClient) {
      setTimeout(() => {
        state.me = { name: 'あいうえお' };
      }, 1000);
    }
  }
}

export interface AuthState {
  me: null | { name: string };
}

export const authPlugin = createVotPlugin({
  async setup(ctx) {
    const state = await ctx.initState(AuthStateInjectionKey, async () => {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        me: null,
      };
    });

    // console.log('kick!!!', ctx.isClient, state);
    // const hoge = await objectHash(state);
    // console.log(hoge, typeof window);

    const auth = new AuthSearvice(ctx, state);
    ctx.auth = auth;
    ctx.provide(AuthSearviceInjectionKey, auth);
  },
});

// Runs in vitest's default node environment: no `window`, so `@fastkit/helpers`
// reports `IN_WINDOW === false` -- the SSR case.
import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { VuePageControl } from '../page-control';

function createControl() {
  const app = createApp({ render: () => null });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  });
  return new VuePageControl({
    app,
    router,
    initialRoute: router.currentRoute.value,
    request: {} as any,
    response: {} as any,
  } as any);
}

describe('force-prefetch flags (server)', () => {
  it('records nothing during a server render', () => {
    const control = createControl();

    // The flag's only effect is to change the `key` passed to the page
    // component, and a vnode key means nothing to a render that happens once
    // and never reconciles. Recording it here would leave state behind in a
    // process that serves every request -- which is what it used to do, while
    // never producing a remount anywhere.
    control._setForcePrefetch('/users', true);

    expect(control._consumeForcePrefetch('/users')).toBeUndefined();
  });

  it('is safe to read for a key that was never flagged', () => {
    const control = createControl();

    expect(control._consumeForcePrefetch('/never-set')).toBeUndefined();
  });
});

// @vitest-environment jsdom
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
  } as any);
}

describe('force-prefetch flags (browser)', () => {
  it('is recorded in the browser, where busting the page key remounts', () => {
    const control = createControl();
    control._setForcePrefetch('/users?page=1', true);

    expect(control._consumeForcePrefetch('/users?page=1')).toBe(true);
  });

  it('is cleared by the first read', () => {
    const control = createControl();
    control._setForcePrefetch('/users', true);

    control._consumeForcePrefetch('/users');

    // A second render of the same key must not remount again.
    expect(control._consumeForcePrefetch('/users')).toBeUndefined();
  });

  it('reports nothing for a key that was never flagged', () => {
    const control = createControl();

    expect(control._consumeForcePrefetch('/never-set')).toBeUndefined();
  });

  it('removes the entry when set to false rather than storing it', () => {
    const control = createControl();
    control._setForcePrefetch('/users', true);
    control._setForcePrefetch('/users', false);

    expect(control._consumeForcePrefetch('/users')).toBeUndefined();
  });

  it('keeps each control to its own flags', () => {
    const a = createControl();
    const b = createControl();

    a._setForcePrefetch('/shared-key', true);

    // The flags used to live in a module-level object, so `b` would have seen
    // -- and consumed -- what `a` recorded.
    expect(b._consumeForcePrefetch('/shared-key')).toBeUndefined();
    expect(a._consumeForcePrefetch('/shared-key')).toBe(true);
  });
});

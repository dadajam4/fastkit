// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import {
  RouterLink,
  createRouter,
  createMemoryHistory,
  type RouteLocationRaw,
} from 'vue-router';
import { VAction } from '../components';
import {
  setDefaultRouterLink,
  registerRouteActionHandler,
} from '../actionable';

const withTrailingSlash = (to: RouteLocationRaw): RouteLocationRaw => {
  if (typeof to === 'string') return to.endsWith('/') ? to : `${to}/`;
  if ('path' in to && to.path && !to.path.endsWith('/')) {
    return { ...to, path: `${to.path}/` };
  }
  return to;
};

/** A RouterLink wrapper that rewrites `to`, like NuxtLink's `trailingSlash: 'append'` */
const TrailingSlashRouterLink = defineComponent({
  inheritAttrs: false,
  props: { to: { type: [String, Object], required: true } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        RouterLink,
        { ...attrs, to: withTrailingSlash(props.to as RouteLocationRaw) },
        slots,
      );
  },
});

/** A RouterLink that only passes `href` to its slot */
const HrefOnlyRouterLink = defineComponent({
  inheritAttrs: false,
  props: { to: { type: [String, Object], required: true } },
  setup(_props, { slots }) {
    return () => slots.default?.({ href: '/rendered' });
  },
});

async function mountAction(props: Record<string, unknown>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:path(.*)*', component: { render: () => null } }],
  });
  await router.push('/');
  const wrapper = mount(() => h(VAction, props, () => 'link'), {
    global: { plugins: [router] },
  });
  await nextTick();
  return { router, wrapper };
}

afterEach(() => {
  setDefaultRouterLink(RouterLink);
  registerRouteActionHandler(undefined as any);
});

describe('useActionable with `to`', () => {
  it('navigates to the location the RouterLink rendered as `href`', async () => {
    setDefaultRouterLink(TrailingSlashRouterLink as any);
    const { router, wrapper } = await mountAction({ to: '/foo' });
    const a = wrapper.get('a');

    expect(a.attributes('href')).toBe('/foo/');

    await a.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/foo/');
  });

  it('honors `replace` through the RouterLink', async () => {
    const { router, wrapper } = await mountAction({
      to: '/foo',
      replace: true,
    });
    await wrapper.get('a').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/foo');
    // `replace` leaves no entry to go back to
    router.back();
    await flushPromises();
    expect(router.currentRoute.value.fullPath).toBe('/foo');
  });

  it('falls back to the route action handler when the slot has no `navigate`', async () => {
    setDefaultRouterLink(HrefOnlyRouterLink as any);
    registerRouteActionHandler(() => '/handled');
    const { router, wrapper } = await mountAction({ to: '/foo' });
    await wrapper.get('a').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/handled');
  });

  it('renders a `to` with a protocol as a plain link', async () => {
    const { router, wrapper } = await mountAction({
      to: 'https://example.com/a',
      replace: true,
    });
    const a = wrapper.get('a');

    expect(a.attributes('href')).toBe('https://example.com/a');
    expect(a.attributes('to')).toBeUndefined();
    expect(a.attributes('replace')).toBeUndefined();
    expect(router.currentRoute.value.fullPath).toBe('/');
  });
});

describe('useActionable when disabled', () => {
  it.each([
    ['`to`', { to: '/foo' }],
    ['`to` with a protocol', { to: 'https://example.com/a' }],
    ['`href`', { href: 'https://example.com/a' }],
  ])('renders a link with %s that cannot be followed', async (_, props) => {
    const { router, wrapper } = await mountAction({ ...props, disabled: true });
    const a = wrapper.get('a');

    expect(a.attributes('href')).toBeUndefined();
    expect(a.attributes('role')).toBe('link');
    expect(a.attributes('aria-disabled')).toBe('true');
    // `<a>` has no `disabled` attribute
    expect(a.attributes('disabled')).toBeUndefined();

    await a.trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.fullPath).toBe('/');
  });

  it('keeps the `disabled` attribute on a button', async () => {
    const { wrapper } = await mountAction({ disabled: true });

    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
  });

  it('does not add a redundant role to an enabled link', async () => {
    const { wrapper } = await mountAction({ href: 'https://example.com/a' });

    expect(wrapper.get('a').attributes('role')).toBeUndefined();
  });
});

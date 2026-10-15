// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Suspense, defineComponent, h, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { useScrollerControl } from '../scroller';

const SelfScroller = defineComponent({
  setup() {
    const control = useScrollerControl({ el: 'self' });
    return () => h('div', { ref: control.elementRef });
  },
});

/** An async sibling that keeps the Suspense boundary pending */
const PendingSibling = defineComponent({
  async setup() {
    await new Promise(() => {});
    return () => null;
  },
});

describe('useScrollerControl', () => {
  it('unmounts without error while a Suspense boundary is still pending', async () => {
    const errors: unknown[] = [];
    const wrapper = mount(
      () =>
        h(Suspense, null, {
          default: () => h('div', [h(SelfScroller), h(PendingSibling)]),
        }),
      {
        global: {
          config: { errorHandler: (err) => errors.push(err) },
        },
      },
    );
    await nextTick();
    wrapper.unmount();
    await flushPromises();
    expect(errors).toEqual([]);
  });
});

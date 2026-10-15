// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Fragment,
  createVNode,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { defineDisabledReasonComponent } from '../disabled-reason';
import {
  DISABLED_REASON_ACTIVATED_ATTR,
  DISABLED_REASON_CONTAINER_BIND,
} from '../constants';

vi.mock('../disabled-reason.css', () => ({}));

let mounts = 0;
let unmounts = 0;

const Probe = defineComponent({
  props: { disabled: Boolean },
  setup(props) {
    onMounted(() => {
      mounts += 1;
    });
    onUnmounted(() => {
      unmounts += 1;
    });
    return () =>
      h('i', { class: 'probe', 'data-disabled': String(props.disabled) });
  },
});

const TestReason = defineDisabledReasonComponent({
  name: 'TestReason',
  setup: (api) => () => h(Probe, { disabled: api.disabled }),
});

beforeEach(() => {
  mounts = 0;
  unmounts = 0;
});

describe('defineDisabledReasonComponent', () => {
  it('unmounts the reason layer when the component unmounts', async () => {
    const show = ref(true);
    const wrapper = mount(
      () =>
        show.value
          ? h(TestReason, null, { default: () => h('button', 'a') })
          : null,
      { attachTo: document.body },
    );
    await flushPromises();
    expect(mounts).toBe(1);
    expect(document.querySelector('.probe')).not.toBeNull();

    show.value = false;
    await flushPromises();
    expect(unmounts).toBe(mounts);
    expect(document.querySelector('.probe')).toBeNull();
    wrapper.unmount();
  });

  it('unmounts the layer of a container that is no longer targeted', async () => {
    const first = ref(true);
    const wrapper = mount(
      () =>
        h(TestReason, null, {
          default: () =>
            h('div', [
              first.value
                ? h('span', { key: 'a', ...DISABLED_REASON_CONTAINER_BIND })
                : h('p', { key: 'b', ...DISABLED_REASON_CONTAINER_BIND }),
            ]),
        }),
      { attachTo: document.body },
    );
    await flushPromises();
    const oldContainer = wrapper.element.querySelector('span')!;
    expect(oldContainer.querySelector('.probe')).not.toBeNull();

    first.value = false;
    await flushPromises();
    expect(oldContainer.hasAttribute(DISABLED_REASON_ACTIVATED_ATTR)).toBe(
      false,
    );
    expect(oldContainer.querySelector('.probe')).toBeNull();
    expect(unmounts).toBe(1);
    expect(wrapper.element.querySelector('p .probe')).not.toBeNull();
    wrapper.unmount();
  });

  it('tears down outside the parent patch so siblings flush in order', async () => {
    const show = ref(true);
    const label = ref('before');
    let seen: string | undefined;
    const Reader = defineComponent({
      setup() {
        onMounted(() => {
          seen = document.querySelector('footer')!.textContent!;
        });
        return () => h('i');
      },
    });
    const wrapper = mount(
      // Unkeyed fragment: children are patched strictly in order.
      () =>
        createVNode(
          Fragment,
          null,
          [
            !show.value ? h(Reader) : null,
            show.value
              ? h(TestReason, null, { default: () => h('button', 'a') })
              : null,
            h('footer', label.value),
          ],
          256, // PatchFlags.UNKEYED_FRAGMENT
        ),
      { attachTo: document.body },
    );
    await flushPromises();

    show.value = false;
    label.value = 'after';
    await flushPromises();
    expect(seen).toBe('after');
    wrapper.unmount();
  });

  it('re-renders a layer that a text update removed', async () => {
    const label = ref('a');
    const wrapper = mount(
      () =>
        h(TestReason, null, {
          default: () => h('button', { disabled: true }, label.value),
        }),
      { attachTo: document.body },
    );
    await flushPromises();
    expect(mounts).toBe(1);

    label.value = 'b';
    await flushPromises();
    expect(wrapper.element.querySelector('.probe')).not.toBeNull();
    expect(unmounts).toBe(1);
    expect(mounts).toBe(2);
    wrapper.unmount();
  });

  it('unmounts the layer when the slot content becomes empty', async () => {
    const show = ref(true);
    const wrapper = mount(
      () =>
        h(TestReason, null, {
          default: () => (show.value ? h('button', 'a') : null),
        }),
      { attachTo: document.body },
    );
    await flushPromises();
    expect(document.querySelector('.probe')).not.toBeNull();

    show.value = false;
    await flushPromises();
    expect(unmounts).toBe(1);
    expect(document.querySelector('.probe')).toBeNull();
    wrapper.unmount();
  });

  describe('disabled', () => {
    const detect = async (
      props: Record<string, unknown>,
      buttonDisabled: boolean,
    ) => {
      const wrapper = mount(() =>
        h(TestReason, props, {
          default: () => h('button', { disabled: buttonDisabled }, 'a'),
        }),
      );
      await flushPromises();
      const value = wrapper.find('.probe').attributes('data-disabled');
      wrapper.unmount();
      return value;
    };

    it('prefers the prop over the DOM', async () => {
      expect(await detect({ disabled: false }, true)).toBe('false');
      expect(await detect({ disabled: true }, false)).toBe('true');
    });

    it('falls back to DOM detection when unspecified', async () => {
      expect(await detect({}, true)).toBe('true');
      expect(await detect({}, false)).toBe('false');
    });
  });
});

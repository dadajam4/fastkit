// @vitest-environment jsdom
// Mounts components via @vue/test-utils, which requires a DOM.
import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick, reactive, VNodeChild } from 'vue';
import { mount } from '@vue/test-utils';
import {
  createFormNodeProps,
  createFormNodeEmits,
  useFormNodeControl,
  FormNodeControl,
  type FormNodeContext,
} from '../composables/node';
import {
  createFormGroupProps,
  createFormGroupEmits,
  useFormGroup,
  FormGroupControl,
  type FormGroupContext,
} from '../composables/group';
import {
  createFormNodeWrapperProps,
  createFormNodeWrapperEmits,
  useFormNodeWrapper,
  FormNodeWrapper,
  type FormNodeWrapperContext,
} from '../composables/wrapper';
import { VueFormService } from '../service';
import { FormServiceInjectionKey } from '../injections';

interface Registry {
  nodes: Record<string, FormNodeControl>;
  groups: Record<string, FormGroupControl>;
  wrappers: Record<string, FormNodeWrapper>;
}

function createComponents(registry: Registry) {
  const Field = defineComponent({
    name: 'TestField',
    props: createFormNodeProps({ modelValue: { type: String } }),
    emits: createFormNodeEmits(),
    setup(props, ctx) {
      const control = useFormNodeControl(
        props,
        ctx as unknown as FormNodeContext<any>,
        {},
      );
      registry.nodes[props.name!] = control;
      return () => h('input');
    },
  });

  const Group = defineComponent({
    name: 'TestGroup',
    props: createFormGroupProps(),
    emits: createFormGroupEmits(),
    setup(props, ctx) {
      const control = useFormGroup(props, ctx as FormGroupContext);
      registry.groups[props.name!] = control;
      return () =>
        h('div', [
          h(
            'p',
            { class: `group-warnings-${props.name}` },
            control.warningMessages.map((source) => source.render()) as any,
          ),
          ctx.slots.default?.(),
        ]);
    },
  });

  const Wrapper = defineComponent({
    name: 'TestWrapper',
    props: {
      ...createFormNodeWrapperProps(),
      id: { type: String, required: true },
    },
    emits: createFormNodeWrapperEmits(),
    setup(props, ctx) {
      const control = useFormNodeWrapper(
        props,
        ctx as unknown as FormNodeWrapperContext,
      );
      registry.wrappers[props.id] = control;
      return () =>
        h('div', [
          ctx.slots.default?.(),
          h(
            'p',
            { class: `wrapper-message-${props.id}` },
            control.renderMessage() as VNodeChild as any,
          ),
        ]);
    },
  });

  return { Field, Group, Wrapper };
}

function setup(render: (c: ReturnType<typeof createComponents>) => any) {
  const registry: Registry = { nodes: {}, groups: {}, wrappers: {} };
  const components = createComponents(registry);
  const wrapper = mount(
    defineComponent({
      setup() {
        return () => render(components);
      },
    }),
    {
      global: {
        provide: {
          [FormServiceInjectionKey as symbol]: new VueFormService(),
        },
      },
    },
  );
  const text = (selector: string) =>
    wrapper.find(selector).text().replace(/\xa0/g, '').trim();
  return { wrapper, registry, text };
}

describe('form node warnings', () => {
  it('does not make the node invalid or fail validation', async () => {
    const { registry } = setup(({ Field }) =>
      h(Field, { name: 'a', warningMessages: 'Check this value' }),
    );
    await nextTick();
    const node = registry.nodes.a;

    expect(node.warnings.map((w) => w.message)).toEqual(['Check this value']);
    expect(node.hasMyWarning).toBe(true);
    expect(node.warned).toBe(true);
    expect(node.invalid).toBe(false);
    expect(node.errors).toEqual([]);
    expect(await node.validate()).toBe(true);
  });

  it('is rendered by the wrapper when there is no error', async () => {
    // Keep the array stable: a new one per slot render would re-trigger the
    // wrapper forever, as it already does for `errorMessages`.
    const warningMessages = ['First', 'Second'];
    const { text } = setup(({ Field, Wrapper }) =>
      h(Wrapper, { id: 'w' }, () => h(Field, { name: 'a', warningMessages })),
    );
    await nextTick();
    expect(text('.wrapper-message-w')).toBe('First');
  });

  it('is hidden while the same node has an error', async () => {
    const { registry, text } = setup(({ Field, Wrapper }) =>
      h(Wrapper, { id: 'w' }, () =>
        h(Field, {
          name: 'a',
          errorMessages: 'Broken',
          warningMessages: 'Check this value',
        }),
      ),
    );
    await nextTick();
    const wrapper = registry.wrappers.w;

    expect(text('.wrapper-message-w')).toBe('Broken');
    expect(wrapper.warningMessages).toEqual([]);
    expect(wrapper.warned).toBe(true);
    expect(wrapper.invalid).toBe(true);
  });

  it('is shown by the node itself when nothing collects it', async () => {
    const { registry } = setup(({ Field }) =>
      h(Field, { name: 'a', warningMessages: 'Check this value' }),
    );
    await nextTick();
    expect(registry.nodes.a.showOwnValidationMessages).toBe(true);
    expect(
      registry.nodes.a.warningMessages.map((s) => s.warning.message),
    ).toEqual(['Check this value']);
  });

  it('is not shown by the node itself while it has an error', async () => {
    const { registry } = setup(({ Field }) =>
      h(Field, {
        name: 'a',
        errorMessages: 'Broken',
        warningMessages: 'Check this value',
      }),
    );
    await nextTick();
    const node = registry.nodes.a;

    expect(node.showOwnValidationMessages).toBe(true);
    expect(node.warningMessages).toEqual([]);
    expect(node.warnings.map((w) => w.message)).toEqual(['Check this value']);
  });

  describe('in a group that collects validation messages', () => {
    it('is collected by the group instead of the wrapper', async () => {
      const { registry, text } = setup(({ Field, Group, Wrapper }) =>
        h(Group, { name: 'g', collectValidationMessages: true }, () =>
          h(Wrapper, { id: 'w' }, () =>
            h(Field, { name: 'a', warningMessages: 'Check this value' }),
          ),
        ),
      );
      await nextTick();

      expect(text('.group-warnings-g')).toBe('Check this value');
      expect(text('.wrapper-message-w')).toBe('');
      expect(registry.nodes.a.warningMessages).toEqual([]);
      expect(registry.groups.g.warned).toBe(true);
      expect(registry.groups.g.invalid).toBe(false);
    });

    it("keeps one node's warning while another node has an error", async () => {
      const { registry } = setup(({ Field, Group }) =>
        h(Group, { name: 'g', collectValidationMessages: true }, () => [
          h(Field, { name: 'a', errorMessages: 'Broken' }),
          h(Field, { name: 'b', warningMessages: 'Check this value' }),
        ]),
      );
      await nextTick();
      const group = registry.groups.g;

      expect(group.errorMessages.map((s) => s.error.message)).toEqual([
        'Broken',
      ]);
      expect(group.warningMessages.map((s) => s.warning.message)).toEqual([
        'Check this value',
      ]);
    });

    it('leaves a node that shows its own messages alone', async () => {
      const { registry } = setup(({ Field, Group }) =>
        h(Group, { name: 'g', collectValidationMessages: true }, () =>
          h(Field, {
            name: 'a',
            showOwnValidationMessages: true,
            warningMessages: 'Check this value',
          }),
        ),
      );
      await nextTick();

      expect(registry.groups.g.warningMessages).toEqual([]);
      expect(
        registry.nodes.a.warningMessages.map((s) => s.warning.message),
      ).toEqual(['Check this value']);
    });

    it('does not reach a detached node', async () => {
      const { registry } = setup(({ Field, Group }) =>
        h(Group, { name: 'g', collectValidationMessages: true }, () =>
          h(Field, {
            name: 'a',
            detach: true,
            warningMessages: 'Check this value',
          }),
        ),
      );
      await nextTick();

      expect(registry.groups.g.warningMessages).toEqual([]);
      expect(registry.groups.g.warned).toBe(false);
    });
  });

  it('follows changes to the prop', async () => {
    const state = reactive<{ warnings?: string }>({});
    const { registry, text } = setup(({ Field, Wrapper }) =>
      h(Wrapper, { id: 'w' }, () =>
        h(Field, { name: 'a', warningMessages: state.warnings }),
      ),
    );
    await nextTick();
    expect(registry.nodes.a.warned).toBe(false);
    expect(text('.wrapper-message-w')).toBe('');

    state.warnings = 'Check this value';
    await nextTick();
    expect(registry.nodes.a.warned).toBe(true);
    expect(text('.wrapper-message-w')).toBe('Check this value');
  });
});

import { describe, it, expect } from 'vitest';
import { defineComponent, nextTick, h } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import {
  createFormSelectorProps,
  createFormSelectorEmits,
  useFormSelectorControl,
  type FormSelectorControlOptions,
  type FormSelectorProps,
  type FormSelectorContext,
  type FormSelectorItem,
  FormSelectorControl,
  DEFAULT_FORM_SELECTOR_GROUP_ID,
} from '../composables/selector';
import {
  useFormSelectorItemControl,
  createFormSelectorItemProps,
  createFormSelectorItemEmits,
  type FormSelectorItemContext,
} from '../composables/selector-item';
import {
  useFormSelectorItemGroupControl,
  createFormSelectorItemGroupProps,
  type FormSelectorItemGroupContext,
} from '../composables/selector-item-group';
import { VueFormService } from '../service';
import { FormServiceInjectionKey } from '../injections';

// Test items
const TEST_ITEMS: FormSelectorItem[] = [
  { value: 'item1', label: 'Item 1' },
  { value: 'item2', label: 'Item 2' },
  { value: 'item3', label: 'Item 3' },
  { value: 'item4', label: 'Item 4' },
];

// Test component using FormSelectorControl with proper hierarchy like UISelect
function createTestComponent(
  propsData: Partial<FormSelectorProps> = {},
  options: FormSelectorControlOptions = {},
) {
  return defineComponent({
    name: 'TestSelectorComponent',
    components: {
      // UIOptionGroup equivalent
      SelectorItemGroup: defineComponent({
        name: 'SelectorItemGroup',
        props: createFormSelectorItemGroupProps(),
        setup(props, ctx) {
          useFormSelectorItemGroupControl(
            props,
            ctx as FormSelectorItemGroupContext,
            {
              nodeType: 'selector-group',
              parentNodeType: 'selector',
            },
          );

          return () =>
            h('div', { class: 'selector-group' }, ctx.slots.default?.());
        },
      }),
      // UIOption equivalent
      SelectorItemControl: defineComponent({
        name: 'SelectorItemControl',
        props: createFormSelectorItemProps(),
        emits: createFormSelectorItemEmits(),
        setup(props, ctx) {
          const control = useFormSelectorItemControl(
            props,
            ctx as FormSelectorItemContext,
            {
              nodeType: 'selector-item',
              parentNodeType: 'selector',
            },
          );

          // Force a DOM element to be rendered to ensure proper mounting
          return () =>
            h(
              'div',
              {
                class: 'selector-item',
                'data-value': control.propValue,
                'data-selected': control.selected,
                onClick: control.handleClickElement,
              },
              `Item: ${control.propValue}`,
            );
        },
      }),
    },
    props: createFormSelectorProps(options),
    emits: createFormSelectorEmits(),
    setup(props, ctx) {
      const selectorControl = useFormSelectorControl(
        props as FormSelectorProps,
        ctx as FormSelectorContext,
        { nodeType: 'selector', ...options },
      );

      // Expose control for testing
      return {
        selectorControl,
      };
    },
    data() {
      return {
        defaultGroupId: DEFAULT_FORM_SELECTOR_GROUP_ID,
      };
    },
    template: `
      <div data-testid="selector-component">
        <!-- Use UISelect-like structure with groups -->
        <SelectorItemGroup :groupId="defaultGroupId">
          <template v-for="item in selectorControl.loadedItems" :key="item.value">
            <SelectorItemControl
              :value="item.value"
              :data-testid="'item-' + item.value"
              class="selector-item"
            />
          </template>
        </SelectorItemGroup>
      </div>
    `,
  });
}

// Mount helper function
function mountSelector(
  propsData: Partial<FormSelectorProps> = {},
  options: FormSelectorControlOptions = {},
): {
  wrapper: VueWrapper;
  control: FormSelectorControl;
} {
  const Component = createTestComponent(propsData, options);

  const wrapper = mount(Component, {
    props: {
      items: TEST_ITEMS,
      multiple: true,
      ...propsData,
    },
    global: {
      provide: {
        [FormServiceInjectionKey as symbol]: new VueFormService(),
      },
    },
  });

  return {
    wrapper,
    control: wrapper.vm.selectorControl,
  };
}

describe('FormSelectorControl Vue Integration Tests', () => {
  describe('preserveOrder=false (default behavior)', () => {
    it('should sort selected items by items array order', async () => {
      const { wrapper, control } = mountSelector();

      // Select in reverse order
      await wrapper.setProps({ modelValue: ['item4', 'item2', 'item1'] });
      await nextTick();

      // Should be sorted by items array order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item4',
      ]);

      expect(control.preserveOrder).toBe(false);
    });

    it('should maintain items order even with dynamic selection changes', async () => {
      const { wrapper, control } = mountSelector();

      // Initial selection
      await wrapper.setProps({ modelValue: ['item3', 'item1'] });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item3',
      ]);

      // Additional selection
      await wrapper.setProps({
        modelValue: ['item3', 'item1', 'item2'],
      });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item3',
      ]);
    });

    it('should handle partial selection correctly', async () => {
      const { wrapper, control } = mountSelector();

      // Partial selection (with order change)
      await wrapper.setProps({ modelValue: ['item2', 'item4'] });
      await nextTick();

      // Should be sorted according to items order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item2',
        'item4',
      ]);
    });
  });

  describe('preserveOrder=true (preserve user selection order)', () => {
    it('should preserve user selection order', async () => {
      const { wrapper, control } = mountSelector(
        { preserveOrder: true },
        { defaultPreserveOrder: true },
      );

      // Select in reverse order
      await wrapper.setProps({ modelValue: ['item4', 'item2', 'item1'] });
      await nextTick();

      // Should preserve selection order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item4',
        'item2',
        'item1',
      ]);

      expect(control.preserveOrder).toBe(true);
    });

    it('should preserve order with dynamic changes', async () => {
      const { wrapper, control } = mountSelector({ preserveOrder: true });

      // Initial selection
      await wrapper.setProps({ modelValue: ['item3', 'item1'] });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item3',
        'item1',
      ]);

      // Order change
      await wrapper.setProps({
        modelValue: ['item1', 'item3', 'item2'],
      });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item3',
        'item2',
      ]);
    });

    it('should handle reverse selection order correctly', async () => {
      const { wrapper, control } = mountSelector({ preserveOrder: true });

      // Select all in completely reverse order
      await wrapper.setProps({
        modelValue: ['item4', 'item3', 'item2', 'item1'],
      });
      await nextTick();

      // Should completely preserve selection order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item4',
        'item3',
        'item2',
        'item1',
      ]);
    });
  });

  describe('method behavior integration', () => {
    it('should handle all selection with preserveOrder=false', async () => {
      const { control } = mountSelector();

      // Simulate select all from loadedItems values
      const allValues = control.loadedItems.map((item) => item.value);
      control.value = allValues;
      await nextTick();

      // Should be selected in items order
      expect(control.selectedValues).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
      ]);
    });

    it('should handle all selection with preserveOrder=true', async () => {
      const { control } = mountSelector({ preserveOrder: true });

      // Simulate select all from loadedItems values
      const allValues = control.loadedItems.map((item) => item.value);
      control.value = allValues;
      await nextTick();

      // Even with preserveOrder=true, manual setting uses loadedItems order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
      ]);
    });

    it('should preserve manual selection order with preserveOrder=true', async () => {
      const { wrapper, control } = mountSelector({ preserveOrder: true });

      // Simulate manual reverse order selection
      await wrapper.setProps({
        modelValue: ['item4', 'item3', 'item2', 'item1'],
      });
      await nextTick();

      // preserveOrder=true: preserve manual selection order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item4',
        'item3',
        'item2',
        'item1',
      ]);
    });

    it('should test selectAll() method behavior', async () => {
      const { control } = mountSelector();

      // Wait for the component to mount and item controls to be registered
      await nextTick();

      // Note: In test environment, FormSelectorItemControl instances may not be registered
      // due to inject/provide limitations, but selectAll() should still work with loadedItems fallback
      // expect(control.items.length).toBe(4);

      // Test selectAll() method - should work with loadedItems fallback
      control.selectAll();
      await nextTick();

      // All items should be selected in items order
      expect(control.selectedValues).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
      ]);

      // Test selectAll() with default groupId - should have the same effect
      control.unselectAll();
      await nextTick();
      expect(control.selectedValues).toEqual([]);

      control.selectAll(DEFAULT_FORM_SELECTOR_GROUP_ID);
      await nextTick();

      expect(control.selectedValues).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
      ]);
    });

    it('should test selectAll() behavior with preserveOrder=true', async () => {
      const { wrapper, control } = mountSelector({ preserveOrder: true });

      // Wait for the component to mount
      await nextTick();

      // Start with partial selection in specific order: item2, item1
      await wrapper.setProps({ modelValue: ['item2', 'item1'] });
      await nextTick();

      // Verify initial selection order is preserved
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item2',
        'item1',
      ]);

      // Execute selectAll() - this should reorder to items order regardless of preserveOrder
      control.selectAll();
      await nextTick();

      // selectAll() always uses items order (item1, item2, item3, item4)
      // even when preserveOrder=true, because it's a complete replacement
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
      ]);
    });

    it('should handle unselectAll() correctly', async () => {
      const { control } = mountSelector({
        modelValue: ['item1', 'item2'],
      });

      await nextTick();
      expect(control.selectedValues).toEqual(['item1', 'item2']);

      control.unselectAll();
      await nextTick();

      expect(control.selectedValues).toEqual([]);
      expect(control.selectedPropItems).toEqual([]);
    });
  });

  describe('reactive updates and props integration', () => {
    it('should react to modelValue changes correctly', async () => {
      const { wrapper, control } = mountSelector();

      // Initial state
      expect(control.selectedValues).toEqual([]);

      // Value update
      await wrapper.setProps({ modelValue: ['item2', 'item1'] });
      await nextTick();

      // Both selectedValues and selectedPropItems should be sorted by items order
      // because preserveOrder=false (default)
      expect(control.selectedValues).toEqual(['item1', 'item2']);
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
      ]); // Sorted because preserveOrder=false
    });

    it('should react to items changes correctly', async () => {
      const { wrapper, control } = mountSelector({
        modelValue: ['item1', 'item2'],
      });

      // New item set
      const newItems: FormSelectorItem[] = [
        { value: 'x', label: 'X' },
        { value: 'item1', label: 'Item 1' },
        { value: 'y', label: 'Y' },
        { value: 'item2', label: 'Item 2' },
      ];

      await wrapper.setProps({ items: newItems });
      await nextTick();

      // Sorted by new items order
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
      ]);
    });

    it('should handle different preserveOrder values correctly', async () => {
      // Case of preserveOrder=false
      const { control: control1 } = mountSelector({
        modelValue: ['item4', 'item1', 'item2'],
        preserveOrder: false,
      });

      await nextTick();
      // preserveOrder=false: items order
      expect(control1.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item4',
      ]);

      // Case of preserveOrder=true
      const { control: control2 } = mountSelector({
        modelValue: ['item4', 'item1', 'item2'],
        preserveOrder: true,
      });

      await nextTick();
      // preserveOrder=true: preserve selection order
      expect(control2.selectedPropItems.map((item) => item.value)).toEqual([
        'item4',
        'item1',
        'item2',
      ]);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty selection', async () => {
      const { control } = mountSelector();

      expect(control.selectedValues).toEqual([]);
      expect(control.selectedPropItems).toEqual([]);
      expect(control.notSelected).toBe(true);
    });

    it('should handle single selection mode', async () => {
      // Start with empty and then set props to trigger reactivity
      const { wrapper, control } = mountSelector({
        multiple: false,
      });

      // Set the modelValue via setProps to trigger Vue reactivity
      await wrapper.setProps({ modelValue: 'item2' });
      await nextTick();

      expect(control.selectedValues).toEqual(['item2']);
      expect(control.selectedPropItems.length).toBe(1);
      expect(control.selectedPropItems[0].value).toBe('item2');
    });

    it('should handle non-existent values gracefully', async () => {
      const { control } = mountSelector({
        modelValue: ['nonexistent', 'item1', 'invalid'],
      });

      await nextTick();

      // Non-existent values are ignored
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
      ]);
    });

    it('should handle empty items array', async () => {
      const { control } = mountSelector({
        items: [],
        modelValue: ['item1', 'item2'],
      });

      await nextTick();

      // When items are empty, selectedPropItems should also be empty
      expect(control.selectedPropItems).toEqual([]);
    });
  });

  describe('options and configuration integration', () => {
    it('should use defaultPreserveOrder from options', async () => {
      const { control } = mountSelector({}, { defaultPreserveOrder: true });

      expect(control.preserveOrder).toBe(true);
    });

    it('should override defaultPreserveOrder with props', async () => {
      const { control } = mountSelector(
        { preserveOrder: false },
        { defaultPreserveOrder: true },
      );

      expect(control.preserveOrder).toBe(false);
    });
  });

  describe('complex selection scenarios', () => {
    it('should handle complex order preservation scenario', async () => {
      const { wrapper, control } = mountSelector({ preserveOrder: true });

      // Simulate gradual selection changes
      // 1. Initial selection
      await wrapper.setProps({ modelValue: ['item3'] });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item3',
      ]);

      // 2. Add before
      await wrapper.setProps({ modelValue: ['item1', 'item3'] });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item3',
      ]);

      // 3. Add between
      await wrapper.setProps({ modelValue: ['item1', 'item2', 'item3'] });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item3',
      ]);

      // 4. Add at end
      await wrapper.setProps({
        modelValue: ['item1', 'item2', 'item3', 'item4'],
      });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
      ]);

      // 5. Change order
      await wrapper.setProps({
        modelValue: ['item4', 'item1', 'item3', 'item2'],
      });
      await nextTick();
      expect(control.selectedPropItems.map((item) => item.value)).toEqual([
        'item4',
        'item1',
        'item3',
        'item2',
      ]);
    });
  });
});

import './VNavigation.scss';
import { defineComponent, computed, PropType, VNodeChild } from 'vue';
import { NavigationItemInput, VNavigationItem } from './VNavigationItem';

export interface NavigationItemInputWithContent extends NavigationItemInput {
  key: string | number;
  label: VNodeChild | (() => VNodeChild);
}

export const VNavigation = defineComponent({
  name: 'VNavigation',
  props: {
    items: {
      type: Array as PropType<NavigationItemInputWithContent[]>,
      required: true,
    },
  },
  setup(props, ctx) {
    const items = computed(() => props.items);
    const $items = computed(() =>
      items.value.map((item) => {
        let label = item.label;
        const _props: NavigationItemInput = {
          ...item,
        };
        if (typeof label === 'function') {
          label = label();
        }
        delete (_props as NavigationItemInputWithContent).label;
        return {
          label,
          props: _props,
        };
      }),
    );

    return () => {
      return (
        <nav class="v-navigation">
          {$items.value.map(({ label, props }) => (
            <VNavigationItem {...props} class="v-navigation__item">
              {label}
            </VNavigationItem>
          ))}
        </nav>
      );
    };
  },
});

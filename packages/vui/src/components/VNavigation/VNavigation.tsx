import './VNavigation.scss';
import { defineComponent, computed, PropType } from 'vue';
import {
  NavigationItemInput,
  renderNavigationItemInput,
} from './VNavigationItem';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export const VNavigation = defineComponent({
  name: 'VNavigation',
  props: {
    items: {
      type: Array as PropType<NavigationItemInput[]>,
      required: true,
    },
    color: String as PropType<ScopeName>,
    startIconEmptySpace: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, ctx) {
    const items = computed(() => props.items);
    const color = useScopeColorClass(props);
    const classes = computed(() => [color.value.className]);
    const startIconEmptySpace = computed(() => props.startIconEmptySpace);

    return () => {
      return (
        <nav class={['v-navigation', classes.value]}>
          {items.value.map((item) =>
            renderNavigationItemInput(item, {
              class: 'v-navigation__item',
              startIconEmptySpace: startIconEmptySpace.value,
            }),
          )}
        </nav>
      );
    };
  },
});

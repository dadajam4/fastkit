import './VNavigation.scss';
import { defineComponent, computed, PropType, VNodeChild } from 'vue';
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
    caption: [String, Function] as PropType<VNodeChild | (() => VNodeChild)>,
  },
  setup(props, ctx) {
    const items = computed(() => props.items);
    const color = useScopeColorClass(props);
    const classes = computed(() => [color.value.className]);
    const startIconEmptySpace = computed(() => props.startIconEmptySpace);
    const caption = computed(() => {
      const c = props.caption;
      return typeof c === 'function' ? c() : c;
    });

    return () => {
      const $caption = caption.value;
      return (
        <nav class={['v-navigation', classes.value]}>
          {!!$caption && <div class="v-navigation__caption">{$caption}</div>}
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

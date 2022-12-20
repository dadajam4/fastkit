import './VNavigation.scss';
import {
  defineComponent,
  computed,
  PropType,
  VNodeChild,
  onBeforeUpdate,
  ref,
} from 'vue';
import {
  NavigationItemInput,
  renderNavigationItemInput,
} from './VNavigationItem';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { createPropsOptions, ExtractPropInput } from '@fastkit/vue-utils';

export function createNavigationProps() {
  return createPropsOptions({
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
  });
}

export type NavigationInput = ExtractPropInput<
  ReturnType<typeof createNavigationProps>
>;

export const VNavigation = defineComponent({
  name: 'VNavigation',
  props: createNavigationProps(),
  setup(props, ctx) {
    const items = computed(() => props.items);
    const color = useScopeColorClass(props);
    const classes = computed(() => [color.value.className]);
    const startIconEmptySpace = computed(() => props.startIconEmptySpace);
    const caption = computed(() => {
      const c = props.caption;
      return typeof c === 'function' ? c() : c;
    });
    const itemsRef = ref<{ key: string | number; ref: any }[]>([]);

    onBeforeUpdate(() => {
      itemsRef.value = [];
    });

    function setItemRef(item: NavigationItemInput, itemRef: any) {
      itemsRef.value.push({ key: item.key, ref: itemRef });
    }

    function onItemActivated(item: NavigationItemInput) {
      itemsRef.value.forEach(({ key, ref }) => {
        if (key === item.key) return;
        ref.close();
      });
    }

    return () => {
      const $caption = caption.value;
      return (
        <nav class={['v-navigation', classes.value]}>
          {!!$caption && <div class="v-navigation__caption">{$caption}</div>}
          {items.value.map((item) =>
            renderNavigationItemInput(item, {
              class: 'v-navigation__item',
              startIconEmptySpace: startIconEmptySpace.value,
              ref: (ref: any) => {
                setItemRef(item, ref);
              },
              onChangeActive: (isActive: boolean) => {
                if (isActive /* && item.children && item.children.length*/) {
                  onItemActivated(item);
                }
              },
            }),
          )}
        </nav>
      );
    };
  },
});

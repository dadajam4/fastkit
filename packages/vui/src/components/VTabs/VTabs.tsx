import './VTabs.scss';
import {
  defineComponent,
  VNodeChild,
  ref,
  PropType,
  computed,
  watch,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
} from 'vue';
import { RawIconProp } from '../VIcon';
import { VuiService } from '../../service';
import { useVui } from '../../injections';
import { defineSlotsProps } from '@fastkit/vue-utils';
import { RouteLocationRaw, RouteLocation } from 'vue-router';
import { VTab, VTabRef } from './VTab';
import {
  VScroller,
  useVScrollerRef,
  ScrollResult,
} from '@fastkit/vue-scroller';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { isPromise } from '@fastkit/helpers';

export interface VTabsItemLabelSlotCtx {
  value: string;
  active: boolean;
  vui: VuiService;
}

export type VTabsItemLabelSlot = (ctx: VTabsItemLabelSlotCtx) => VNodeChild;

export type VTabsRouterHandler = (value: string) => RouteLocationRaw;

export type VTabsGuard = (
  nextValue: string,
  oldValue: string,
) => boolean | void | undefined | Promise<boolean | void | undefined>;

export interface VTabsItem {
  value: string;
  icon?: RawIconProp;
  label?: VNodeChild | VTabsItemLabelSlot;
}

export const VTabs = defineComponent({
  name: 'VTabs',
  props: {
    modelValue: String,

    items: {
      type: Array as PropType<VTabsItem[]>,
      required: true,
      // validator: (value: VTabsItem[]) => {
      //   return Array.isArray(value) && value.length > 0;
      // },
    },

    /**
     * 自動スクロールする際の余剰オフセット幅（px）
     */
    autoScrollOffset: {
      type: Number,
      default: 20,
    },

    /**
     * ルーター同期する場合設定する
     */
    router: Function as PropType<VTabsRouterHandler>,

    /**
     * ルーティング連携を行う際に、クエリベースのURLマッチングを行う
     * タブのURLが /page1?tab=xxx のようになる時に設定する
     */
    withQuery: Boolean,
    ...defineSlotsProps<{
      item: VTabsItemLabelSlotCtx;
    }>(),

    color: String as PropType<ScopeName>,
    onBeforeChange: Function as PropType<VTabsGuard>,
  },
  emits: {
    'update:modelValue': (newValue: string) => true,
    change: (newValue: string) => true,
  },
  setup(props, ctx) {
    const vui = useVui();

    const internalValueRef = ref<string>(null as any);
    const scrollerRef = useVScrollerRef();
    const elRef = ref<HTMLElement>(null as any);
    let scrollResult: ScrollResult | undefined;
    const tabRefs = ref<VTabRef[]>([]);

    const currentRef = computed({
      get: () => internalValueRef.value,
      set: (value) => {
        if (internalValueRef.value !== value) {
          internalValueRef.value = value;
          ctx.emit('update:modelValue', value);
          ctx.emit('change', value);
        }
      },
    });

    const colorScope = useScopeColorClass({
      color: () => props.color || vui.setting('tabDefault').color,
    });

    const classes = computed(() => [colorScope.value.className]);

    const computedItemsRef = computed(() => {
      const current = currentRef.value;
      const { router } = props;
      return props.items.map((item) => {
        const { value } = item;
        const active = current === value;
        let location:
          | {
              to: RouteLocationRaw;
              route: RouteLocation & {
                href: string;
              };
            }
          | undefined;

        if (router) {
          const to = router(value);
          const route = vui.router.resolve(to);
          location = { to, route };
        }

        return {
          ...item,
          active,
          location,
        };
      });
    });

    const setTabRef = (ref: VTabRef) => {
      tabRefs.value.push(ref);
    };

    // const isMountedRef = ref(false);

    function setupInternalValue(routable?: boolean) {
      let value = props.modelValue;
      if (value == null || value === '') {
        const firstItem = props.items[0];
        if (!firstItem) return;
        value = firstItem.value;
      }
      if (internalValueRef.value !== value) {
        internalValueRef.value = value;

        if (routable) {
          const { router } = props;
          if (!router) return;
          const hit = computedItemsRef.value.find(
            (item) => item.value === value,
          );
          if (!hit) return;
          const { location } = hit;
          if (!location) return;
          const { to, route } = location;
          if (route.fullPath === vui.location.currentRoute.fullPath) return;
          vui.router[to.replace ? 'replace' : 'push'](to);
        } else if (!props.router && props.modelValue !== value) {
          ctx.emit('update:modelValue', value);
          ctx.emit('change', value);
        }
      }
    }

    async function to(value: string) {
      const { value: currentValue } = currentRef;
      if (currentValue === value) {
        return;
      }
      const { onBeforeChange } = props;
      if (onBeforeChange) {
        let result = onBeforeChange(value, currentRef.value);
        if (isPromise(result)) {
          result = await result;
        }
        console.log(result);
        if (result === false) {
          return;
        }
      }
      currentRef.value = value;
    }

    function cancelScroll() {
      if (scrollResult) {
        scrollResult.cancel();
        scrollResult = undefined;
      }
    }

    const findTab = (tab: string) => {
      return tabRefs.value.find((t) => t.value === tab);
    };

    function scrollToTab(tabValue: string) {
      const tab = findTab(tabValue);
      if (!tab) return;
      const $tab = tab.$el as HTMLElement;
      if (!$tab) return;

      const scroller = scrollerRef.value;
      if (!scroller) return;
      const container = scroller.scroller.element();
      if (!container) return;

      const { autoScrollOffset } = props;
      const tabLeft = $tab.offsetLeft;
      const tabWidth = $tab.offsetWidth;
      const tabRight = tabLeft + tabWidth;
      let hiddenLeft = 0;
      let hiddenRight = 0;

      const { scrollLeft, offsetWidth: scrollerWidth } = container;
      hiddenLeft = Math.max(scrollLeft - tabLeft, 0);
      hiddenRight = Math.max(tabRight - scrollerWidth - scrollLeft, 0);

      if (hiddenLeft > 0) hiddenLeft += autoScrollOffset;
      if (hiddenRight > 0) hiddenRight += autoScrollOffset;

      let scrollAmmount = 0;
      if (hiddenRight > 0) {
        scrollAmmount = hiddenRight;
      }
      if (hiddenLeft > 0) {
        scrollAmmount = -hiddenLeft;
      }

      if (Math.abs(scrollAmmount) > 0) {
        cancelScroll();
        scrollResult = scroller.scroller.by(scrollAmmount, 0, {
          duration: 150,
        });
      }
    }

    watch(
      () => props.modelValue,
      () => setupInternalValue(true),
    );

    watch(
      () => props.items,
      () => setupInternalValue(),
      { deep: true },
    );

    watch(
      () => internalValueRef.value,
      (newValue) => {
        scrollToTab(newValue);
      },
    );

    vui.location.watchRoute(
      (route) => {
        if (!props.router) return;
        const path = props.withQuery ? route.fullPath : route.path;
        const hit = computedItemsRef.value.find(({ location }) => {
          return location && location.route.fullPath === path;
        });
        if (hit) {
          currentRef.value = hit.value;
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      scrollToTab(currentRef.value);
    });

    onBeforeUnmount(() => {
      cancelScroll();
    });

    onBeforeUpdate(() => {
      tabRefs.value = [];
    });

    setupInternalValue();

    return () => {
      const items = computedItemsRef.value;
      const itemSlot = ctx.slots.item as VTabsItemLabelSlot | undefined;
      const children = items.map(({ value, active, label, icon, location }) => {
        if (!label) {
          label = itemSlot;
        }

        const children =
          typeof label === 'function' ? label({ value, active, vui }) : label;

        const _to = (location && location.to) || undefined;

        return (
          <VTab
            value={value}
            to={_to}
            icon={icon}
            active={active}
            ref={setTabRef as any}
            onClick={(e) => {
              if (!e.defaultPrevented) {
                to(value);
              }
            }}>
            {children}
          </VTab>
        );
      });

      return (
        <div class={['v-tabs', classes.value]} ref={elRef}>
          <VScroller
            class="v-tabs__scroller"
            containerClass="v-tabs__scroller__container"
            guide
            ref={scrollerRef}>
            <div class="v-tabs__content">{children}</div>
          </VScroller>
        </div>
      );
    };
  },
});

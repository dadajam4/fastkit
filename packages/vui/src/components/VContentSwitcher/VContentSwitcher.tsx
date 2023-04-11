import './VContentSwitcher.scss';

import {
  defineComponent,
  PropType,
  ref,
  computed,
  watch,
  Transition,
} from 'vue';
import { getDocumentScroller } from '@fastkit/vue-scroller';
import { VTabsItem } from '../VTabs/VTabs';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export interface ContentSwitcherSeeTopOptions {
  /**
   * スクロールする際のオフセット高px
   */
  offset?: number;

  /**
   * スクロール期間
   */
  duration?: number;
}

export const VContentSwitcher = defineComponent({
  name: 'VContentSwitcher',
  props: {
    modelValue: String,
    order: {
      type: Array as PropType<(string | VTabsItem)[]>,
      default: () => [],
    },
    autotop: [Boolean, Object] as PropType<
      boolean | ContentSwitcherSeeTopOptions
    >,
  },
  emits: {
    'update:modelValue': (modelValue: string) => true,
  },
  setup(props, ctx) {
    const internalValueRef = ref('');
    const transitionRef = ref('');
    const elRef = ref<HTMLElement | null>(null);
    const anchorRef = ref<HTMLElement | null>(null);
    const computedOrderRef = computed(() =>
      props.order.map((row) => {
        return typeof row === 'string' ? row : row.value;
      }),
    );
    const currentRef = computed({
      get: () => internalValueRef.value,
      set: (current) => {
        if (internalValueRef.value !== current) {
          internalValueRef.value = current;
          ctx.emit('update:modelValue', current);
        }
      },
    });
    const autotopSettingsRef = computed<
      ContentSwitcherSeeTopOptions | undefined
    >(() => {
      let { autotop: settings } = props;
      if (settings === true) settings = {};
      if (!settings) return;
      return {
        ...settings,
      };
    });

    function seeTop(options?: ContentSwitcherSeeTopOptions) {
      const scoller = getDocumentScroller();
      const { value: anchor } = anchorRef;
      if (anchor) {
        scoller.toElement(anchor, options);
      }
    }

    function getEl() {
      const el = elRef.value;
      if (!el) {
        throw new Error('missing element');
      }
      return el;
    }

    watch(
      () => props.modelValue,
      (value, beforeValue) => {
        if (value == null) return;
        internalValueRef.value = value;

        if (beforeValue == null) return;

        const order = computedOrderRef.value;
        const index = order.indexOf(value);
        const beforeIndex = order.indexOf(beforeValue);

        let transition = 'fade';
        if (index !== -1 && beforeIndex !== -1) {
          if (index > beforeIndex) transition = 'v-content-switcher-next';
          if (index < beforeIndex) transition = 'v-content-switcher-prev';
        }
        transitionRef.value = transition;
      },
      { immediate: true },
    );

    watch(currentRef, () => {
      const autotopSettings = autotopSettingsRef.value;
      if (autotopSettings && props.modelValue != null) {
        seeTop(autotopSettings);
      }
    });

    return () => {
      const current = currentRef.value;
      const children = renderSlotOrEmpty(ctx.slots) || [];
      const currentSlot = ctx.slots[current];

      if (currentSlot) {
        children.push(
          <div class="v-content-switcher__content" key={current}>
            {currentSlot(this)}
          </div>,
        );
      }

      return (
        <div class="v-content-switcher" ref={elRef}>
          <div class="v-content-switcher__anchor" ref={anchorRef} />
          <Transition
            name={transitionRef.value}
            onBeforeLeave={(el) => {
              getEl().style.height = (el as HTMLElement).offsetHeight + 'px';
            }}
            onEnter={(el) => {
              getEl().style.height = (el as HTMLElement).offsetHeight + 'px';
            }}
            onAfterEnter={() => {
              getEl().style.height = '';
            }}
            onEnterCancelled={() => {
              getEl().style.height = '';
            }}
            onLeaveCancelled={() => {
              getEl().style.height = '';
            }}>
            {children}
          </Transition>
        </div>
      );
    };
  },
});

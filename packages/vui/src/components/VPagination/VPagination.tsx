import './VPagination.scss';

import {
  defineComponent,
  PropType,
  ref,
  watch,
  computed,
  withDirectives,
} from 'vue';
import {
  createPropsOptions,
  rawNumberPropType,
  resolveNumberish,
} from '@fastkit/vue-utils';
import { isPromise } from '@fastkit/helpers';
import { useRouter, RouterLink } from 'vue-router';
import { resolveRawIconProp } from '../VIcon';
import { resizeDirectiveArgument } from '@fastkit/vue-resize';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { useVui } from '../../injections';

export type VPaginationGuard = (
  page: number,
) => boolean | void | Promise<boolean | void>;

export const PAGINATION_ALIGNS = ['left', 'center', 'right'] as const;

export type VPaginationAlign = (typeof PAGINATION_ALIGNS)[number];

export function paginationProps() {
  return createPropsOptions({
    /**
     * Active Pages
     */
    modelValue: {
      type: rawNumberPropType,
      default: 1,
    },

    /**
     * Total number of pages
     */
    length: {
      type: rawNumberPropType,
      default: 0,
    },

    /**
     * Maximum number of links to display.
     */
    totalVisible: rawNumberPropType,

    /**
     * true when narrowing
     */
    dense: Boolean,
    disabled: Boolean,
    align: {
      type: String as PropType<VPaginationAlign>,
      default: 'center',
    },

    /**
     * To synchronize with a query, use the query name
     */
    routeQuery: String,
    beforeChange: Function as PropType<VPaginationGuard>,
    color: String as PropType<ScopeName>,
  });
}

type ItemSource = number | 'prev' | 'next' | 'truncate';

export const VPagination = defineComponent({
  name: 'VPagination',
  props: paginationProps(),
  emits: {
    change: (page: number) => true,
    'update:modelValue': (page: number) => true,
  },
  setup(props, ctx) {
    const vui = useVui();
    const elRef = ref<HTMLElement | null>(null);
    const router = useRouter();
    const internalValue = ref(1);
    const containerWidth = ref(0);
    const itemSize = ref(0);
    const capacityLength = computed(() => {
      const _itemSize = itemSize.value;
      if (!_itemSize) return 0;
      return Math.floor(containerWidth.value / _itemSize);
    });
    const colorScope = useScopeColorClass({
      color: () => props.color || vui.setting('primaryScope'),
    });
    const computedLength = computed(() => resolveNumberish(props.length));
    const computedTotalVisible = computed(() =>
      resolveNumberish(props.totalVisible),
    );
    const computedNumbersLength = computed(() => capacityLength.value - 2 - 2);
    const computedPage = computed(() => {
      const { routeQuery } = props;
      if (routeQuery) {
        return vui.location.getQuery(routeQuery, Number, 1);
      }
      return internalValue.value;
    });

    const _range = (from: number, to: number) => {
      const range: number[] = [];

      from = from > 0 ? from : 1;

      for (let i = from; i <= to; i++) {
        range.push(i);
      }

      return range;
    };

    const computedItems = computed<ItemSource[]>(() => {
      const maxButtons = computedNumbersLength.value;
      const totalVisible = computedTotalVisible.value;
      const length = computedLength.value;
      const pageValue = computedPage.value;

      const maxLength = Math.min(
        Math.max(0, totalVisible || 0) || length,
        Math.max(0, maxButtons) || length,
        length,
      );
      if (length <= maxLength) {
        return _range(1, length);
      }
      const even = maxLength % 2 === 0 ? 1 : 0;
      const left = Math.floor(maxLength / 2);
      const right = length - left + 1 + even;

      if (pageValue > left && pageValue < right) {
        const start = pageValue - left + 2;
        const end = pageValue + left - 2 - even;

        return [1, 'truncate', ..._range(start, end), 'truncate', length];
      } else if (pageValue === left) {
        const end = pageValue + left - 1 - even;
        return [..._range(1, end), 'truncate', length];
      } else if (pageValue === right) {
        const start = pageValue - left + 1;
        return [1, 'truncate', ..._range(start, length)];
      } else {
        return [..._range(1, left), 'truncate', ..._range(right, length)];
      }
    });

    const isActive = computed(() => computedLength.value > 1);

    const isTransitioning = computed(() => {
      const { routeQuery } = props;
      return vui.location.isQueryOnlyTransitioning(routeQuery);
    });

    const isDisabled = computed(() => props.disabled || isTransitioning.value);

    const classes = computed(() => [
      {
        'v-pagination--disabled': isDisabled.value,
        'v-pagination--dense': props.dense,
        [`v-pagination--${props.align}`]: true,
      },
      colorScope.value.className,
    ]);

    async function setPage(value: number | string) {
      if (isDisabled.value) return;
      const { beforeChange, routeQuery } = props;
      const newPage = resolveNumberish(value);
      if (computedPage.value === newPage) return;
      if (beforeChange) {
        try {
          let result = beforeChange(newPage);
          if (isPromise(result)) result = await result;
          if (result === false) return;
        } catch (e) {}
      }
      if (routeQuery) {
        const to = createRoutableLocationByPage(newPage, routeQuery);
        return router.push(to).then((failure) => {
          !failure && ctx.emit('change', newPage);
        });
      } else {
        internalValue.value = newPage;
        (ctx as any).emit('update:modelValue', newPage);
        ctx.emit('change', newPage);
      }
    }

    function createPageInfo(source: ItemSource): {
      number: boolean;
      page: number | undefined;
      active: boolean;
      disabled: boolean;
    } {
      const currentPage = computedPage.value;
      const length = computedLength.value;
      let number: boolean;
      let page: number | undefined;
      let active: boolean;
      let disabled: boolean;

      if (typeof source === 'number') {
        number = true;
        page = source;
        active = currentPage === page;
        disabled = false;
      } else if (source === 'truncate') {
        number = false;
        active = false;
        disabled = false;
      } else {
        number = false;
        const isPrev = source === 'prev';
        const ammount = isPrev ? -1 : 1;
        page = currentPage + ammount;
        active = false;
        disabled = page < 1 || page > length;
      }

      return {
        number,
        page,
        active,
        disabled,
      };
    }

    function createRoutableLocationByPage(page: number, routeQuery: string) {
      return vui.location.getQueryMergedLocation({
        [routeQuery]: page,
      });
    }

    function genItem(source: ItemSource, index: number) {
      const { number, page, active, disabled } = createPageInfo(source);
      const type = number ? 'num' : source;
      const classes = [
        'v-pagination__item',
        {
          [`v-pagination__item--${type}`]: true,
          'v-pagination__item--active': active,
          'v-pagination__item--disabled': disabled,
        },
      ];
      const children = number
        ? page
        : (() => {
            if (type === 'truncate') {
              return <span>...</span>;
            }

            const isPrev = type === 'prev';
            const icon = isPrev ? vui.icon('prev') : vui.icon('next');
            return resolveRawIconProp(false, icon, {
              class: 'v-pagination__item__icon',
            });
          })();

      const onClick = (ev: MouseEvent) => {
        ev.preventDefault();
        if (page === undefined || active || disabled) return;
        setPage(page);
      };

      const key = `${source}-${index}`;

      const { routeQuery } = props;

      if (page !== undefined && routeQuery) {
        const to = createRoutableLocationByPage(page, routeQuery);
        return (
          <RouterLink
            class={classes}
            to={to}
            key={key}
            // event=""
            // nativeOn={
            //   page === undefined
            //     ? undefined
            //     : {
            //         click: onClick,
            //       }
            // }
          >
            {children}
          </RouterLink>
        );
      } else {
        return (
          <button
            class={classes}
            type="button"
            value={page}
            onClick={onClick}
            key={key}>
            {children}
          </button>
        );
      }
    }

    watch(
      () => props.modelValue,
      (modelValue) => {
        internalValue.value = resolveNumberish(modelValue);
      },
      { immediate: true },
    );

    return () => {
      if (!isActive.value) return undefined;
      const $items = [
        'prev' as const,
        ...computedItems.value,
        'next' as const,
      ].map((i, index) => genItem(i, index));

      return withDirectives(
        <nav class={['v-pagination', classes.value]} ref={elRef}>
          {$items}
        </nav>,
        [
          resizeDirectiveArgument(({ width }) => {
            const el = elRef.value;
            if (el) {
              const style = window.getComputedStyle(el, 'before');
              const width = style.getPropertyValue('width');
              const margin = style.getPropertyValue('margin');
              const size = parseFloat(width) + parseFloat(margin) * 0.5;
              itemSize.value = size;
            }
            containerWidth.value = width;
          }),
        ],
      );
    };
  },
});

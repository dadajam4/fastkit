import './VDataTable.scss';

import {
  defineComponent,
  VNodeChild,
  PropType,
  ref,
  computed,
  onMounted,
  watch,
  CSSProperties,
  VNodeArrayChildren,
  withDirectives,
  Transition,
} from 'vue';
import { useVui } from '../../injections';
import type { VuiService } from '../../service';
import { VSelect } from '../VSelect';
import { VPagination } from '../VPagination';
import { VCheckbox } from '../VCheckbox';
import { VIcon, resolveRawIconProp } from '../VIcon';
import { VProgressCircular } from '../loading';
import { resizeDirectiveArgument } from '@fastkit/vue-utils';
import { VAppLayoutControl } from '@fastkit/vue-app-layout';
import { VPaper } from '../VPaper';

export type DataTableHeaderAlign = 'left' | 'center' | 'right';

const DATA_TABLE_DEFAULTS = {
  itemKey: 'id',
  pageQuery: 'page',
  sortQuery: 'sort',
  orderQuery: 'order',
  limitQuery: 'limit',
  defaultOrder: 'ASC',
  ascQueryValue: 'ASC',
  descQueryValue: 'DESC',
  limits: [5, 10, 20, 50, 100],
  limitDefault: 20,
  contorolThreshold: 10,
};

export type DataTableDefaults = typeof DATA_TABLE_DEFAULTS;

export function configureDataTableDefaults(
  defaults: Partial<DataTableDefaults>,
) {
  Object.assign(DATA_TABLE_DEFAULTS, defaults);
  if (!defaults.defaultOrder && defaults.ascQueryValue) {
    DATA_TABLE_DEFAULTS.defaultOrder = defaults.ascQueryValue;
  }
}

export interface DataTableItem {
  [key: string]: any;
}

export interface DataTableItemSlotPayload<
  T extends DataTableItem = DataTableItem,
> {
  key: string;
  item: T;
  /**
   * 選択されている場合true
   */
  selected: boolean;
}

export interface DataTableCellSlotPayload<
  T extends DataTableItem = DataTableItem,
> {
  vui: VuiService;
  item: T;
  /**
   * 選択されている場合true
   */
  selected: boolean;
}

export interface DataTableHeader {
  key: number | string;
  label?: VNodeChild | ((vui: VuiService) => VNodeChild);
  sortQuery?: string;
  hidden?: boolean;
  align?: DataTableHeaderAlign;
  cell?: (payload: DataTableCellSlotPayload) => VNodeChild;
}

const SELECTABLE_HEADER_SYMBOL = '__selectable_header__';

export const VDataTable = defineComponent({
  name: 'VDataTable',
  props: {
    /** 選択中のkeyの配列 */
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => [],
    },

    itemKey: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.itemKey,
    },

    /**
     * ページネーションクエリ名
     */
    pageQuery: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.pageQuery,
    },

    /**
     * ソートクエリ名
     */
    sortQuery: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.sortQuery,
    },

    /**
     * 表示順クエリ名
     */
    orderQuery: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.orderQuery,
    },

    /**
     * リミット件数クエリ名
     */
    limitQuery: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.limitQuery,
    },
    defaultOrder: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.defaultOrder,
    },
    ascQueryValue: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.ascQueryValue,
    },
    descQueryValue: {
      type: String,
      default: () => DATA_TABLE_DEFAULTS.descQueryValue,
    },
    limits: {
      type: Array as PropType<number[]>,
      default: () => DATA_TABLE_DEFAULTS.limits,
    },
    limitDefault: {
      type: Number,
      default: () => DATA_TABLE_DEFAULTS.limitDefault,
    },
    contorolThreshold: {
      type: Number,
      default: () => DATA_TABLE_DEFAULTS.contorolThreshold,
    },
    headers: {
      type: Array as PropType<DataTableHeader[]>,
      required: true,
    },
    items: {
      type: Array as PropType<DataTableItem[]>,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    selectable: Boolean,
    fixedHeader: Boolean,
    maxHeight: [Number, String],
  },
  emits: {
    input: (selecteds: string[]) => true,
  },
  setup(props, ctx) {
    const vui = useVui();
    const bootedRef = ref(false);
    const footerHeightRef = ref(0);
    const internalValues = ref<string[]>(props.modelValue.slice());
    const sortedItemKeysRef = computed(() =>
      props.items.map((item) => item[props.itemKey]),
    );
    const isEmptyRef = computed(() => props.items.length === 0);
    const headersRef = computed<DataTableHeader[]>(() => {
      const { headers, selectable } = props;
      const ret: DataTableHeader[] = [];
      if (selectable) {
        ret.push({
          key: SELECTABLE_HEADER_SYMBOL,
        });
      }
      ret.push(...headers.filter((h) => !h.hidden));
      return ret;
    });
    const classesRef = computed(() => [
      {
        'v-data-table--fixed-header': props.fixedHeader,
      },
    ]);

    const layout = VAppLayoutControl.use();

    const bodyInnerStylesRef = computed<CSSProperties | undefined>(() => {
      if (!bootedRef.value) return;

      const { fixedHeader, maxHeight } = props;
      const footerHeight = footerHeightRef.value;

      const _maxHeight = maxHeight || (fixedHeader ? '100%' : maxHeight);

      if (!_maxHeight) {
        return;
      }

      return {
        maxHeight: layout.calicurateViewHeight(
          _maxHeight,
          -footerHeight - 100,
          200,
        ),
      };
    });

    const defaultOrderQueryRef = computed(() =>
      props.defaultOrder === props.ascQueryValue
        ? props.ascQueryValue
        : props.descQueryValue,
    );

    const isTransitioningRef = computed(() => {
      return vui.location.isQueryOnlyTransitioning([
        props.pageQuery,
        props.sortQuery,
        props.orderQuery,
        props.limitQuery,
      ]);
    });

    const pageRef = computed(() =>
      vui.location.getQuery(props.pageQuery, Number, 1),
    );

    const needShowHeaderControlRef = computed(
      () => props.items.length > props.contorolThreshold,
    );

    const sortByRef = computed({
      get: () => {
        return vui.location.getQuery(props.sortQuery);
      },
      set(value) {
        vui.location.pushQuery({
          [props.sortQuery]: value || null,
          [props.pageQuery]: 1,
        });
      },
    });

    const ordersRef = computed(() => [
      props.ascQueryValue,
      props.descQueryValue,
    ]);

    const usePaigingRef = computed(() => props.limits.length > 0);

    const orderByRef = computed({
      get: () => {
        const value = vui.location.getQuery(props.orderQuery);
        if (typeof value !== 'string' || !ordersRef.value.includes(value)) {
          return;
        }
        return value;
      },
      set(value) {
        vui.location.pushQuery({
          [props.orderQuery]: value || null,
          [props.pageQuery]: 1,
        });
      },
    });

    const offsetRef = computed(() => (pageRef.value - 1) * limitRef.value);

    const limitRef = computed({
      get: () =>
        vui.location.getQuery(props.limitQuery, Number, props.limitDefault),
      set: (value) => {
        const page = Math.floor(offsetRef.value / value) + 1;
        vui.location.pushQuery({
          [props.limitQuery]: value,
          [props.pageQuery]: page,
        });
      },
    });

    const pageLengthRef = computed(() => {
      const { total } = props;
      const _limit = limitRef.value;
      if (!total) return 0;
      return Math.ceil(total / _limit);
    });

    const lengthRef = computed(() => props.items.length);

    const isASCRef = computed(() => orderByRef.value === props.ascQueryValue);
    // const isDESCRef = computed(() => orderByRef.value === props.descQueryValue);
    const sortIconRef = computed(() => {
      let icon = vui.icon('sort');
      if (typeof icon === 'string') {
        const name = icon;
        icon = (gen) => {
          return gen({
            name,
            rotate: isASCRef.value ? 180 : 0,
          });
        };
      }
      return icon;
    });

    const isIndeterminateRef = computed(() => {
      const { length } = internalValues.value;
      return length > 0 && length < sortedItemKeysRef.value.length;
    });

    const isAllSelectedRef = computed(
      () => internalValues.value.length === sortedItemKeysRef.value.length,
    );

    function setSort(settings: { sort?: string; order?: string }) {
      const { sort, order } = settings;
      if (
        (sort === undefined || sortByRef.value === sort) &&
        (order === undefined || orderByRef.value === order)
      )
        return;

      const queries: { [key: string]: string } = {};
      if (sort) {
        queries[props.sortQuery] = sort as string;
      }
      if (order) {
        queries[props.orderQuery] = order as string;
      }

      vui.location.pushQuery({
        ...queries,
        [props.pageQuery]: 1,
      });
    }

    function toggleOrderBy() {
      return setSort({
        order:
          orderByRef.value === props.ascQueryValue
            ? props.descQueryValue
            : props.ascQueryValue,
      });
    }

    function isSelected(key: string) {
      return internalValues.value.includes(key);
    }

    function select(key: string) {
      if (!internalValues.value.includes(key)) {
        const values = internalValues.value.slice();
        values.push(key);
        const sortedKeys = sortedItemKeysRef.value;
        values.sort((a, b) => {
          const ai = sortedKeys.indexOf(a);
          const bi = sortedKeys.indexOf(b);
          if (ai < bi) return -1;
          if (ai > bi) return 1;
          return 0;
        });
        internalValues.value = values;
        ctx.emit('input', values);
      }
    }

    function selectAll() {
      if (!isAllSelectedRef.value) {
        const values = sortedItemKeysRef.value.slice();
        internalValues.value = values;
        ctx.emit('input', values);
      }
    }

    function deselectAll() {
      if (internalValues.value.length) {
        const values: string[] = [];
        internalValues.value = values;
        ctx.emit('input', values);
      }
    }

    function deselect(key: string) {
      const values = internalValues.value.slice();
      const index = values.indexOf(key);
      if (index !== -1) {
        values.splice(index, 1);
        internalValues.value = values;
        ctx.emit('input', values);
      }
    }

    function handleClickSortHeader(header: DataTableHeader, ev: MouseEvent) {
      const { sortQuery } = header;
      if (!sortQuery) return;
      if (sortByRef.value === sortQuery) {
        return toggleOrderBy();
      }
      return setSort({
        sort: sortQuery,
        order: defaultOrderQueryRef.value,
      });
    }

    function genPagination() {
      return (
        <VPagination
          class="v-data-table__pagination"
          dense
          align="right"
          routeQuery={props.pageQuery}
          modelValue={pageRef.value}
          length={pageLengthRef.value}
        />
      );
    }

    function genControls() {
      const { total } = props;
      const offset = offsetRef.value;
      const length = lengthRef.value;

      return (
        <div class="v-data-table__controls">
          <div class="v-data-table__controls__info">
            <small class="v-data-table__controls__info__length">
              全 {total} 件中 {offset + 1} 件 〜 {offset + length} 件を表示
            </small>
          </div>
          <div class="v-data-table__controls__select-limit">
            <span class="v-data-table__controls__select-limit__prefix">
              1ページに
            </span>
            <VSelect
              class="v-data-table__controls__select-limit__node"
              size="sm"
              hiddenInfo
              disabled={isTransitioningRef.value}
              items={props.limits.map((limit) => {
                return {
                  label: `${limit}件`,
                  value: limit,
                };
              })}
              v-model={limitRef.value}
            />
          </div>
          <div class="v-data-table__controls__pagination">
            {genPagination()}
          </div>
        </div>
      );
    }

    function genTableHeader() {
      const sortBy = sortByRef.value;
      const isIndeterminate = isIndeterminateRef.value;
      const isAllSelected = isAllSelectedRef.value;
      const { defaultOrder, ascQueryValue } = props;
      const usePaiging = usePaigingRef.value;

      const children = headersRef.value.map((header) => {
        const { label, sortQuery, align, key } = header;
        const headerChildren: VNodeArrayChildren = [];
        if (label != null && typeof label !== 'boolean') {
          let _children = typeof label === 'function' ? label(vui) : label;
          if (
            _children &&
            !Array.isArray(_children) &&
            typeof _children === 'object'
          ) {
            _children = JSON.stringify(_children);
          }
          headerChildren.push(_children);
        }
        if (key === SELECTABLE_HEADER_SYMBOL) {
          headerChildren.push(
            <VCheckbox
              modelValue={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(ev) => {
                if (isAllSelectedRef.value) {
                  deselectAll();
                } else {
                  selectAll();
                }
              }}
            />,
          );
        }
        // if (key === DELETOR_HEADER_SYMBOL) {
        //   headerChildren.push('削除');
        // }

        const sortActive = sortBy === sortQuery;

        if (sortQuery && usePaiging) {
          const isASC = sortActive
            ? isASCRef.value
            : defaultOrder === ascQueryValue;
          headerChildren.unshift(
            <VIcon
              class="v-data-table__table__sort-icon v-data-table__table__sort-icon--empty"
              name="$empty"
            />,
          );
          headerChildren.push(
            resolveRawIconProp(false, sortIconRef.value, {
              class: [
                'v-data-table__table__sort-icon v-data-table__table__sort-icon--arrow',
                {
                  'v-data-table__table__sort-icon--asc': isASC,
                  'v-data-table__table__sort-icon--desc': !isASC,
                },
              ],
            }),
            // <VIcon
            //   class={[
            //     'v-data-table__table__sort-icon v-data-table__table__sort-icon--arrow',
            //     {
            //       'v-data-table__table__sort-icon--asc': isASC,
            //       'v-data-table__table__sort-icon--desc': !isASC,
            //     },
            //   ]}
            //   name="mdi-chevron-down"
            // />,
          );
        }

        const classes = [
          'v-data-table__table__cell',
          {
            'v-data-table__table__cell--active': sortActive,
          },
        ];

        if (align) {
          classes.push(`v-data-table__table__cell--${align}`);
        }

        return (
          <th
            class={classes}
            key={header.key}
            tabindex={sortQuery && usePaiging ? 0 : undefined}
            onClick={(ev) => {
              if (!sortQuery || !usePaiging) return;
              handleClickSortHeader(header, ev);
            }}>
            <div class="v-data-table__table__cell__tile">{headerChildren}</div>
          </th>
        );
      });
      return (
        <thead class="v-data-table__table__header">
          <tr>{children}</tr>
        </thead>
      );
    }

    function toggleSelect(key: string) {
      return isSelected(key) ? deselect(key) : select(key);
    }

    function defaultItemSlot(payload: DataTableItemSlotPayload) {
      const { key, item, selected } = payload;
      const headers = headersRef.value;
      // const { $scopedSlots, $createElement, deletor } = this;
      const children = headers.map((header) => {
        const { cell, align, key: headerKey } = header;
        const cellSlot = cell || ctx.slots.cell;
        let cellChildren: VNodeChild;
        if (cellSlot) {
          const cellPayload: DataTableCellSlotPayload = {
            vui,
            item,
            selected,
          };
          let _children = cellSlot(cellPayload);
          if (
            _children &&
            !Array.isArray(_children) &&
            typeof _children === 'object'
          ) {
            _children = JSON.stringify(_children);
          }
          cellChildren = _children;
        }

        if (!cellChildren) {
          switch (headerKey) {
            case SELECTABLE_HEADER_SYMBOL: {
              cellChildren = [
                <VCheckbox
                  modelValue={selected}
                  onChange={(ev) => {
                    toggleSelect(key);
                  }}
                  // checkHandler={(e) => {
                  //   this.toggleSelect(key as T[K]);
                  // }}
                />,
              ];
              break;
            }
            // case DELETOR_HEADER_SYMBOL: {
            //   if (deletor) {
            //     const onClick = async (event: MouseEvent) => {
            //       if (
            //         await this.$confirm(`${key}を削除します。よろしいですか？`)
            //       ) {
            //         this.deletingTargets.push(key);
            //         await deletor(item);
            //         this.deletingTargets.splice(
            //           this.deletingTargets.indexOf(key),
            //           1,
            //         );
            //       }
            //     };
            //     cellChildren = [
            //       <VBtn
            //         icon="trush"
            //         onClick={onClick}
            //         disabled={this.deletingTargets.includes(key)}
            //       />,
            //     ];
            //   }
            //   break;
            // }
          }
        }

        const classes = align
          ? {
              [`v-data-table__table__cell--${align}`]: true,
            }
          : undefined;

        return (
          <td class={['v-data-table__table__cell', classes]} key={header.key}>
            {cellChildren}
          </td>
        );
      });
      return (
        <tr
          class={[
            'v-data-table__table__item',
            {
              'v-data-table__table__item--selected': selected,
            },
          ]}
          key={key}>
          {children}
        </tr>
      );
    }

    function genBody() {
      const { items, itemKey } = props;
      const { item: itemSlot = defaultItemSlot } = ctx.slots;

      const children = items.map((item) => {
        const key = item[itemKey];
        const payload: DataTableItemSlotPayload = {
          key,
          item,
          selected: isSelected(key),
        };
        return itemSlot(payload);
      });
      return <tbody class="v-data-table__table__body">{children}</tbody>;
    }

    watch(
      () => props.modelValue,
      (modelValue) => {
        internalValues.value = modelValue.slice();
      },
    );

    watch(
      () => props.items,
      (items) => {
        internalValues.value = internalValues.value.filter((key) => {
          return sortedItemKeysRef.value.includes(key);
        });
      },
    );

    onMounted(() => {
      bootedRef.value = true;
    });

    return () => {
      const isEmpty = isEmptyRef.value;
      const usePaiging = usePaigingRef.value;
      return (
        <div class={['v-data-table', classesRef.value]}>
          {!isEmpty && usePaiging && needShowHeaderControlRef.value && (
            <div class="v-data-table__header">{genControls()}</div>
          )}
          <div class="v-data-table__body container-pull">
            {isEmpty ? (
              <div class="v-data-table__empty--message">
                {/* {this.computedEmptyMessage} */}
              </div>
            ) : (
              <VPaper
                class="v-data-table__body__inner"
                style={bodyInnerStylesRef.value}>
                <div class="v-data-table__table-wrapper">
                  <table class="v-data-table__table">
                    {genTableHeader()}
                    {genBody()}
                  </table>
                </div>
              </VPaper>
            )}
            <Transition name="fade">
              {isTransitioningRef.value && (
                <div class="v-data-table__loading">
                  <VProgressCircular indeterminate />
                </div>
              )}
            </Transition>
          </div>
          {!isEmpty &&
            usePaiging &&
            withDirectives(
              <div class="v-data-table__footer">{genControls()}</div>,
              [
                resizeDirectiveArgument(({ height }) => {
                  footerHeightRef.value = height;
                }),
              ],
            )}
        </div>
      );
    };
  },
});
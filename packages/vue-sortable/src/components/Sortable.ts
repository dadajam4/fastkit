import {
  defineComponent,
  h,
  type SetupContext,
  type VNode,
  type SlotsType,
} from 'vue';
import { type SortableData } from '../schema';
import { OPTION_NAMES } from '../schema/_internal';
import {
  type SortableProps,
  type SortableEmits,
  type SortableContext,
  type SortableItemDetails,
  useSortable,
} from '../composables';
import { withSortableDirective } from '../directives';

export interface SortableWrapperSlotContext<
  T extends SortableData = SortableData,
> {
  get sortable(): SortableContext<T>;
  get children(): VNode[];
  get attrs(): Record<string, any>;
}

export interface SortableItemSlotContext<T extends SortableData = SortableData>
  extends SortableItemDetails<T> {
  get sortable(): SortableContext<T>;
}

type Slots<T extends SortableData = SortableData> = {
  wrapper?: (ctx: SortableWrapperSlotContext<T>) => any;
  item?: (ctx: SortableItemSlotContext<T>) => any;
};

const SORTABLE_PROPS = [
  'modelValue',
  'clone',
  'beforeUpdate',
  ...OPTION_NAMES,
] as const satisfies (keyof SortableProps)[];

const unwrapArray = <T>(source: T): T extends Array<infer U> ? U : T =>
  (Array.isArray(source) ? source[0] : source) as any;

export const Sortable = defineComponent(
  <T extends SortableData = SortableData>(
    props: SortableProps<T> & { 'v-slots'?: Slots<T>; 'v-model'?: T[] },
    ctx: SetupContext<SortableEmits<T>, SlotsType<Slots<T>>>,
  ) => {
    const sortable = useSortable(props, ctx);
    const wrapperSlotDefault: NonNullable<Slots<T>['wrapper']> = ({
      children,
    }) => h('div', null, children);
    const itemSlotDefault: NonNullable<Slots<T>['item']> = ({ attrs }) =>
      h('div', attrs);

    return () => {
      const wrapperSlot = ctx.slots.wrapper || wrapperSlotDefault;
      const itemSlot = ctx.slots.item || itemSlotDefault;
      const children = sortable.items.map((item) =>
        unwrapArray(
          itemSlot({
            sortable,
            ...item,
          }),
        ),
      );
      const wrapper = unwrapArray(
        wrapperSlot({
          sortable,
          children,
          attrs: sortable.wrapperAttrs,
        }),
      );
      return withSortableDirective(wrapper, sortable.directiveValue as any);
    };
  },
  {
    props: SORTABLE_PROPS as unknown as undefined,
    // slots: undefined as unknown as Hoge<T>,
  },
);

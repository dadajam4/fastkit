import {
  defineComponent,
  h,
  type SetupContext,
  type VNode,
  type SlotsType,
  type ShallowUnwrapRef,
  type VNodeProps,
  type AllowedComponentProps,
  type ComponentCustomProps,
} from 'vue';
import { type EmitFn, type EmitsToProps } from '@fastkit/vue-utils';
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
  'itemKey',
  'itemKeyCandidates',
  'clone',
  'beforeUpdate',
  ...OPTION_NAMES,
] as const satisfies (keyof SortableProps)[];

const unwrapArray = <T>(source: T): T extends Array<infer U> ? U : T =>
  (Array.isArray(source) ? source[0] : source) as any;

type EmitsProps<T extends SortableData = SortableData> = EmitsToProps<
  SortableEmits<T>
>;

type BuiltinComponentProps = VNodeProps &
  AllowedComponentProps &
  ComponentCustomProps;

type GenericProps<T extends SortableData = SortableData> = SortableProps<T> &
  EmitsProps & {
    'v-model'?: T[];
    'v-slots'?: Slots<T>;
  } & BuiltinComponentProps;

type GenericEmitFn<T extends SortableData = SortableData> = EmitFn<
  SortableEmits<T>
>;

type GenericSlots<T extends SortableData = SortableData> = Readonly<Slots<T>>;

type GenericSetupContext<T extends SortableData = SortableData> = {
  attrs: any;
  emit: GenericEmitFn<T>;
  slots: GenericSlots<T>;
};

type VLSSetup<T extends SortableData = SortableData> =
  GenericSetupContext<T> & {
    props: SortableProps<T>;
    expose(exposed: ShallowUnwrapRef<{}>): void;
  };

type GenericSortable = <T extends SortableData = SortableData>(
  __VLS_props: GenericProps<T>,
  __VLS_ctx?: GenericSetupContext<T>,
  __VLS_expose?: (exposed: ShallowUnwrapRef<{}>) => void,
  __VLS_setup?: Promise<VLSSetup<T>>,
) => VNode & {
  __ctx?: VLSSetup<T>;
}; // & DefineComponentExpose<GenericTableInstance>;

export const Sortable = defineComponent(
  <T extends SortableData = SortableData>(
    props: SortableProps<T> & { 'v-slots'?: Slots<T>; 'v-model'?: T[] },
    ctx: SetupContext<SortableEmits<T>, SlotsType<Slots<T>>>,
    _expose?: (exposed: ShallowUnwrapRef<{}>) => void,
    _setup?: Promise<VLSSetup<T>>,
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
  },
) as unknown as GenericSortable;

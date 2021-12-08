import './VIcon.scss';
import {
  defineComponent,
  PropType,
  computed,
  CSSProperties,
  VNodeChild,
  VNodeProps,
} from 'vue';
import { createPropsOptions, ExtractPropInput } from '@fastkit/vue-utils';
import type { IconName } from '@fastkit/icon-font';

export type { IconName } from '@fastkit/icon-font';
export { ICON_NAMES } from '@fastkit/icon-font';

type IconPropInout = ExtractPropInput<typeof iconProps>;

type IconGenerator = (input: IconPropInout) => VNodeChild;

type EmptyIconSymbol = '$empty';

type ToggleableIconHook = (gen: IconGenerator, ctx: boolean) => VNodeChild;

export type RawIconProp = IconName | EmptyIconSymbol | ToggleableIconHook;

// export function toRawIconProp<T = void>(
//   prop: RawIconProp<T>,
//   payload: () => T,
// ): RawIconProp {
//   if (!prop || typeof prop !== 'function') {
//     return prop;
//   }
//   const fn = (gen: IconGenerator): VNodeChild => {
//     const t = payload();
//     return prop(gen, t);
//   };
//   return fn;
// }

// export const rawRawIconProp = [String, Function] as PropType<RawIconProp>;
const _rawIconProp = [String, Function];

export function rawIconProp() {
  return _rawIconProp as PropType<RawIconProp>;
}

export function resolveRawIconProp(
  payload: boolean,
  prop?: RawIconProp,
  extraProps?: Record<string, unknown> & VNodeProps,
): VNodeChild {
  if (!prop) return;

  return typeof prop === 'function' ? (
    prop(
      (input: IconPropInout) => <VIcon {...input} {...(extraProps as any)} />,
      payload,
    )
  ) : (
    <VIcon {...(extraProps as any)} name={prop} />
  );
}

export const iconProps = createPropsOptions({
  name: {
    type: String as PropType<IconName | EmptyIconSymbol>,
    required: true,
  },
  rotate: {
    type: Number,
  },
});

export const VIcon = defineComponent({
  name: 'VIcon',
  props: {
    ...iconProps,
  },
  emits: {} as {
    click: (ev: MouseEvent) => true;
  },
  setup(props, ctx) {
    const iconName = computed(() => props.name);
    const clickable = computed(
      () => typeof (ctx.attrs as any).onClick !== 'undefined',
    );
    const classes = computed(() => [
      {
        'v-icon--clickable': clickable.value,
      },
    ]);
    const bodyClasses = computed(() => `icon-${iconName.value}`);
    const bodyStyles = computed<CSSProperties | undefined>(() => {
      const { rotate } = props;
      if (!rotate) return;
      return {
        transform: `rotate(${rotate}deg)`,
      };
    });

    return () => (
      <span class={[`v-icon notranslate`, classes.value]}>
        <i
          class={['v-icon__body icon', bodyClasses.value]}
          style={bodyStyles.value}
        />
      </span>
    );
  },
});

import './VStackBtn.scss';
import {
  defineComponent,
  ExtractPropTypes,
  // PropType,
  // AllowedComponentProps,
  // ComponentCustomProps,
  // VNodeProps,
  // VNode,
} from 'vue';
import {
  colorSchemeProps,
  useColorClasses,
  // ScopeName,
} from '@fastkit/vue-color-scheme';
import {
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  ExtractPropInput,
} from '@fastkit/vue-utils';

export const stackBtnProps = {
  ...colorSchemeProps({ defaultScope: 'base', defaultVariant: 'contained' }),
  ...navigationableProps,
  spacer: Boolean,
};

export type VStackBtnProps = ExtractPropInput<typeof stackBtnProps>;

export type VStackBtnResolvedProps = ExtractPropTypes<typeof stackBtnProps>;

const VStackBtnImpl = defineComponent({
  name: 'VStackBtn',
  props: stackBtnProps,
  emits: {
    ...navigationableEmits.emits,
  },
  setup(props) {
    const color = useColorClasses(props);
    const navigationable = useNavigationable(props);
    return {
      ...color,
      navigationable,
    };
  },
  render() {
    const { navigationable, colorClasses, $slots } = this;
    const { Tag, attrs, classes } = navigationable;
    const children = $slots.default && $slots.default();
    return (
      <Tag
        class={[
          'v-stack-btn',
          colorClasses,
          classes,
          this.spacer ? 'v-stack-btn--spacer' : undefined,
        ]}
        {...attrs}
        onClick={(ev: MouseEvent) => {
          if (this.disabled) return;
          this.$emit('click', ev);
        }}>
        {children}
      </Tag>
    );
  },
});

export const VStackBtn = VStackBtnImpl as typeof VStackBtnImpl & {
  new (): {
    $props: VStackBtnProps;
  };
};

// type A = typeof VStackBtnImpl;
// type B = A & {
//   new (): {
//     $props: AllowedComponentProps &
//       ComponentCustomProps &
//       VNodeProps &
//       VStackBtnProps & {
//         /** abc */
//         color?: ScopeName;
//       };

//     $slots: {
//       default: (arg: { a: number }) => VNode[];
//     };
//   };
// }

// const Hoge = null as B;
// <Hoge co></Hoge>

// type FugaComponent<Props, Slots> = {
//   new (): {
//     $props: AllowedComponentProps & ComponentCustomProps & VNodeProps & Props;
//     $slots: {
//       default: (arg: { a: number }) => VNode[];
//     };
//   };
// };

// export const VStackBtn = VStackBtnImpl as unknown as {
//   new (): {
//     $props: AllowedComponentProps &
//       ComponentCustomProps &
//       VNodeProps &
//       VStackBtnProps & {
//         /** abc */
//         hoge?: ScopeName;
//       };

//     $slots: {
//       default: (arg: { a: number }) => VNode[];
//     };
//   };
// };

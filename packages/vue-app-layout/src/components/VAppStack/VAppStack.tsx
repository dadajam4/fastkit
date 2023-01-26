import * as styles from './VAppStack.css';
import {
  defineComponent,
  PropType,
  Teleport,
  Transition,
  computed,
  withDirectives,
  vShow,
} from 'vue';
import {
  VueAppLayoutStickPositionX,
  VueAppLayoutStickPositionY,
  VAL_X_POSITIONS,
  VAL_Y_POSITIONS,
} from '../../schemes';
import {
  useVueAppLayout,
  VueAppStack,
  VueAppStackTransitionSettings,
  VueAppStackBackdropSettings,
} from '../../controls';
import { defineSlotsProps } from '@fastkit/vue-utils';

export interface VAppStackRef {
  get: () => VueAppStack;
}

export const VAppStackVerticalPositionProps = {
  top: String as PropType<VueAppLayoutStickPositionY>,
  bottom: String as PropType<VueAppLayoutStickPositionY>,
};

export const VAppStack = defineComponent({
  name: 'VAppStack',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    backdrop: [Boolean, Object] as PropType<
      boolean | VueAppStackBackdropSettings
    >,
    transition: [String, Object] as PropType<VueAppStackTransitionSettings>,
    ...VAppStackVerticalPositionProps,
    left: String as PropType<VueAppLayoutStickPositionX>,
    right: String as PropType<VueAppLayoutStickPositionX>,
    ...defineSlotsProps<{
      default: VueAppStack;
    }>(),
  },
  emits: {
    'update:modelValue': (modelValue: boolean) => true,
  },
  setup(props, ctx) {
    const layout = useVueAppLayout();
    const stack = layout.launchStack(props, (modelValue) =>
      ctx.emit('update:modelValue', modelValue),
    );
    const hostStaticStyles = ['VAppStack', styles.host];
    const hostClasses = computed(() => {
      const { positions } = stack;
      const { hostPositions } = styles;
      const classes: (string | string[])[] = [hostStaticStyles];

      VAL_X_POSITIONS.forEach((x) => {
        classes.push(hostPositions[x][positions[x]]);
      });

      VAL_Y_POSITIONS.forEach((y) => {
        classes.push(hostPositions[y][positions[y]]);
      });
      return classes;
    });

    const api: VAppStackRef = {
      get: () => stack,
    };

    ctx.expose(api);

    return () => {
      const { backdrop } = stack;
      const body = ctx.slots.default?.(stack)?.[0];

      return (
        <Teleport to="body">
          <div class={hostClasses.value} {...ctx.attrs}>
            {backdrop && (
              <Transition key="backdrop" {...backdrop.transition}>
                {stack.active && (
                  <div
                    class={styles.backdrop}
                    v-body-scroll-lock={stack.active}
                    onClick={backdrop.onClick}
                  />
                )}
              </Transition>
            )}
            <Transition key="body" {...stack.transition}>
              {!!body && withDirectives(body as any, [[vShow, stack.active]])}
            </Transition>
          </div>
        </Teleport>
      );
    };
  },
});

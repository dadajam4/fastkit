import {
  defineComponent,
  PropType,
  Teleport,
  Transition,
  computed,
  withDirectives,
  vShow,
} from 'vue';
import { defineSlots } from '@fastkit/vue-utils';
import * as styles from './VAppStack.css';
import {
  VueAppLayoutStickPositionX,
  VueAppLayoutStickPositionY,
  VAL_X_POSITIONS,
  VAL_Y_POSITIONS,
  VueAppLayoutPositionY,
  VAL_BAR_TYPES,
} from '../../schemes';
import {
  useVueAppLayout,
  VueAppStack,
  VueAppStackTransitionSettings,
  VueAppStackBackdropSettings,
} from '../../controls';

export interface VAppStackRef {
  get: () => VueAppStack;
}

export const VAppStackVerticalPositionProps = {
  top: String as PropType<VueAppLayoutStickPositionY>,
  bottom: String as PropType<VueAppLayoutStickPositionY>,
};

const slots = defineSlots<{
  default?: (stack: VueAppStack) => any;
}>();

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
    ...slots(),
  },
  emits: {
    'update:modelValue': (modelValue: boolean) => true,
  },
  slots,
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

    const renderBarSpacers = (y: VueAppLayoutPositionY) => {
      const barClasses = styles.barSpacers[y];
      return VAL_BAR_TYPES.map((bar) => (
        <div key={bar} class={barClasses[bar]} />
      ));
    };

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
            {renderBarSpacers('top')}
            <div class={styles.inner}>
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
                {!!body && withDirectives(body, [[vShow, stack.active]])}
              </Transition>
            </div>
            {renderBarSpacers('bottom')}
          </div>
        </Teleport>
      );
    };
  },
});

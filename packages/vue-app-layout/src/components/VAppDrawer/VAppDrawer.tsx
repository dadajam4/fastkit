import * as styles from './VAppDrawer.css';
import { defineComponent, PropType, onBeforeUnmount, computed } from 'vue';
import {
  VueAppLayoutPositionX,
  VAL_Y_POSITIONS,
  VueAppDrawerId,
} from '../../schemes';
import {
  useVueAppLayout,
  VueAppDrawer,
  VueAppDrawerControl,
  VueAppDrawerStaticCondition,
  VueAppDrawerRaleCondition,
  VueAppDrawerStickedSettings,
  VueAppStackTransitionSettings,
} from '../../controls';
import { defineSlotsProps } from '@fastkit/vue-utils';
import { VAppStack, VAppStackVerticalPositionProps } from '../VAppStack';
import { useBooting } from '../../composables/booting';

export interface VAppDrawerRef {
  get: () => VueAppDrawer;
}

export const VAppDrawer = defineComponent({
  name: 'VAppDrawer',
  inheritAttrs: false,
  props: {
    id: [String, Number, Symbol, Object] as PropType<
      VueAppDrawerId | VueAppDrawerControl
    >,
    position: String as PropType<VueAppLayoutPositionX>,
    ...VAppStackVerticalPositionProps,
    sticked: [String, Boolean, Object] as PropType<VueAppDrawerStickedSettings>,
    static: [Boolean, Function] as PropType<VueAppDrawerStaticCondition>,
    rale: [Boolean, Function] as PropType<VueAppDrawerRaleCondition>,
    transition: [String, Object] as PropType<VueAppStackTransitionSettings>,
    backdrop: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    ...defineSlotsProps<{
      default: VueAppDrawer;
    }>(),
  },
  setup(props, ctx) {
    const layout = useVueAppLayout();
    const drawer = layout.launchDrawer(props);
    const staticStyles = ['VAppDrawer', styles.host];
    const booting = useBooting();

    const classesRef = computed(() => {
      const positionStyles = styles.positions[drawer.position];
      const hostClasses: (string | string[] | undefined)[] = [
        staticStyles,
        positionStyles.host,
        booting.styles,
      ];

      drawer.isActive && hostClasses.push(positionStyles.isActive);
      drawer.isStatic && hostClasses.push(positionStyles.isStatic);
      drawer.isRale && hostClasses.push(positionStyles.isRale);
      drawer.hasBackdrop && hostClasses.push(positionStyles.hasBackdrop);
      VAL_Y_POSITIONS.forEach((y) => {
        const stickPosition = drawer[y];
        hostClasses.push(positionStyles.stickedTo[y][stickPosition]);
      });
      return {
        host: hostClasses,
        transition: positionStyles.body,
        body: {
          class: [positionStyles.body, styles.bodyBase],
        },
      };
    });

    const api: VAppDrawerRef = {
      get: () => drawer,
    };

    ctx.expose(api);

    onBeforeUnmount(() => layout.disposeDrawer(drawer));

    return () => {
      const classes = classesRef.value;
      return (
        <VAppStack
          ref={drawer.stackRef}
          class={classes.host}
          transition={props.transition || classes.transition}
          backdrop={drawer.hasBackdrop}
          top={drawer.top}
          bottom={drawer.bottom}
          modelValue={drawer.isActive || drawer.isStatic}
          v-slots={{
            default: () => (
              <div class={classes.body.class}>
                {ctx.slots.default?.(drawer)}
              </div>
            ),
          }}
        />
      );
    };
  },
});

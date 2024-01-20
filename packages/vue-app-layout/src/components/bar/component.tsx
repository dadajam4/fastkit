import { defineComponent, PropType, computed, Teleport, Transition } from 'vue';
import { defineSlots } from '@fastkit/vue-utils';
import * as _styles from './styles.css';
import { VueAppLayoutPositionY, VueAppLayoutBarType } from '../../schemes';
import {
  useVueAppLayout,
  VueAppBar,
  VueAppBarActivateCondition,
} from '../../controls';
import { useBooting } from '../../composables/booting';

export interface DefineBarComponentSettings {
  name: string;
  type: VueAppLayoutBarType;
}

const slots = defineSlots<{
  default?: (bar: VueAppBar) => any;
}>();

export function defineBarComponent(settings: DefineBarComponentSettings) {
  const { name, type } = settings;
  const styles = _styles[type];

  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      position: String as PropType<VueAppLayoutPositionY>,
      active: {
        type: [Boolean, Function] as PropType<VueAppBarActivateCondition>,
        default: true,
      },
      ...slots(),
    },
    slots,
    setup(props, ctx) {
      const layout = useVueAppLayout();
      const bar = layout.launchBar(props);
      const booting = useBooting();
      const staticStyles = [name, _styles.hostBase];
      const computedStylesRef = computed(() => {
        const positionStyles = styles.positions[bar.position];
        const classes: (string | string[] | undefined)[] = [
          staticStyles,
          positionStyles.host,
          booting.styles,
        ];
        return {
          host: classes,
          transition: positionStyles.host,
        };
      });

      ctx.expose(bar);

      return () => {
        const computedStyles = computedStylesRef.value;
        const children = ctx.slots.default?.(bar);
        const hasChild =
          !!children && Array.isArray(children) ? children.length > 0 : true;
        const isActive = hasChild && bar.isActive;

        return (
          <Teleport to="body">
            <Transition name={computedStyles.transition}>
              {isActive && (
                <div class={[computedStyles.host]} {...ctx.attrs}>
                  {children}
                </div>
              )}
            </Transition>
          </Teleport>
        );
      };
    },
  });
}

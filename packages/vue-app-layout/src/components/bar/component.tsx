import * as _styles from './styles.css';
import { defineComponent, PropType, computed, Teleport, Transition } from 'vue';
import { VueAppLayoutPositionY, VueAppLayoutBarType } from '../../schemes';
import {
  useVueAppLayout,
  VueAppBar,
  VueAppBarActivateCondition,
} from '../../controls';
import { defineSlotsProps } from '@fastkit/vue-utils';
import { useBooting } from '../../composables/booting';

export interface DefineBarComponentSettings {
  name: string;
  type: VueAppLayoutBarType;
}

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
      ...defineSlotsProps<{
        default: VueAppBar;
      }>(),
    },
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

import './VToolbar.scss';
import { defineComponent, computed } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import { createElevationProps, useElevation } from '../../composables';
import { useVui } from '../../injections';

export const VToolbar = defineComponent({
  name: 'VToolbar',
  props: {
    ...createElevationProps(),
    ...colorSchemeProps(),
    dense: Boolean,
  },
  setup(props, ctx) {
    const vui = useVui();

    const elevation = useElevation(props, { defaultValue: 4 });
    const dense = computed(() => props.dense);
    const color = useColorClasses({
      color: () => props.color,
      variant: () => props.variant || vui.setting('containedVariant'),
    });

    const classes = computed(() => {
      return [
        elevation.elevationClassName.value,
        color.colorClasses.value,
        {
          'v-toolbar--plain': !color.color.value.value,
          'v-toolbar--dense': dense.value,
        },
      ];
    });

    return () => {
      return (
        <div class={['v-toolbar', classes.value]}>
          {renderSlotOrEmpty(ctx.slots, 'default')}
        </div>
      );
    };
  },
});

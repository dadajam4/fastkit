import './VIcon.scss';
import { defineComponent, PropType, computed, CSSProperties } from 'vue';
import type { IconName } from '@fastkit/icon-font';

export type { IconName } from '@fastkit/icon-font';
export { ICON_NAMES } from '@fastkit/icon-font';

export const VIcon = defineComponent({
  name: 'VIcon',
  props: {
    name: {
      type: String as PropType<IconName>,
      required: true,
    },
    rotate: {
      type: Number,
    },
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

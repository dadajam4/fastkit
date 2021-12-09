import './VProgressCircular.scss';
import { defineComponent, computed, h, PropType } from 'vue';
import {
  NumberishPropOption,
  resolveNumberish,
  renderSlotOrEmpty,
} from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export const VProgressCircular = defineComponent({
  name: 'VProgressCircular',
  props: {
    color: String as PropType<ScopeName>,
    button: Boolean,
    indeterminate: Boolean,
    rotate: NumberishPropOption,
    size: NumberishPropOption,
    width: NumberishPropOption,
    value: NumberishPropOption,
  },
  setup(props, ctx) {
    const radius = computed(() => 20);
    const width = computed(() => resolveNumberish(props.width, 2));
    const size = computed(() => resolveNumberish(props.size, 32));
    const rotate = computed(() => resolveNumberish(props.rotate, 0));
    const indeterminate = computed(() => props.indeterminate);
    const circumference = computed(() => 2 * Math.PI * radius.value);
    const colorClass = useScopeColorClass(props);

    const classes = computed(() => {
      const classes: any[] = [
        {
          'v-progress-circular--indeterminate': props.indeterminate,
          'v-progress-circular--button': props.button,
          'v-progress-circular--has-color': !!colorClass.value.value,
        },
        colorClass.value.className,
      ];
      return classes;
    });

    const normalizedValue = computed(() => {
      const value = resolveNumberish(props.value, 0);
      if (value < 0) {
        return 0;
      }
      if (value > 100) {
        return 100;
      }
      return value;
    });

    const calculatedSize = computed(() => size.value + (props.button ? 8 : 0));

    const strokeDashArray = computed(
      () => Math.round(circumference.value * 1000) / 1000,
    );

    const strokeDashOffset = computed(
      () => ((100 - normalizedValue.value) / 100) * circumference.value + 'px',
    );

    const viewBoxSize = computed(
      () => radius.value / (1 - width.value / +size.value),
    );

    const strokeWidth = computed(
      () => (width.value / +size.value) * viewBoxSize.value * 2,
    );

    const styles = computed(() => {
      const { value } = calculatedSize;
      return {
        height: `${value}px`,
        width: `${value}px`,
      };
    });

    const svgStyles = computed(() => ({
      transform: `rotate(${rotate.value}deg)`,
    }));

    function genCircle(name: string, offset: string | number) {
      const cv = 2 * viewBoxSize.value;
      return h('circle', {
        class: `v-progress-circular__${name}`,
        fill: 'transparent',
        cx: cv,
        cy: cv,
        r: radius.value,
        'stroke-width': strokeWidth.value,
        'stroke-dasharray': strokeDashArray.value,
        'stroke-dashoffset': offset,
      });
    }

    function genSvg() {
      const children = [
        indeterminate.value || genCircle('underlay', 0),
        genCircle('overlay', strokeDashOffset.value),
      ];
      const vSize = viewBoxSize.value;

      return h(
        'svg',
        {
          style: svgStyles.value,
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: `${vSize} ${vSize} ${2 * vSize} ${2 * vSize}`,
        },
        children,
      );
    }

    return () => {
      const info = h(
        'span',
        { class: 'v-progress-circular__info' },
        renderSlotOrEmpty(ctx.slots, 'default'),
      );

      const svg = genSvg();

      return (
        <span
          class={['v-progress-circular', classes.value]}
          style={styles.value}
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={
            indeterminate.value ? undefined : normalizedValue.value
          }>
          {svg}
          {info}
        </span>
      );
    };
  },
});

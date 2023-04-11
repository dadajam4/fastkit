import './VProgressLinear.scss';
import {
  defineComponent,
  computed,
  CSSProperties,
  Transition,
  PropType,
} from 'vue';
import { NumberishPropOption, resolveNumberish } from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export const VProgressLinear = defineComponent({
  name: 'VProgressLinear',
  props: {
    color: String as PropType<ScopeName>,
    active: Boolean,
    indeterminate: Boolean,
    query: Boolean,
    backgroundOpacity: NumberishPropOption,
    bufferValue: NumberishPropOption,
    height: NumberishPropOption,
    value: NumberishPropOption,
  },
  setup(props, ctx) {
    const backgroundOpacity = computed(() =>
      resolveNumberish(props.backgroundOpacity),
    );
    const bufferValue = computed(() =>
      resolveNumberish(props.bufferValue, 100),
    );
    const active = computed(() => props.active);
    const height = computed(() => resolveNumberish(props.height, 4));
    const value = computed(() => resolveNumberish(props.value, 0));
    const indeterminate = computed(() => props.indeterminate);
    const query = computed(() => props.query);

    const normalizedBufer = computed(() => {
      const _bufferValue = bufferValue.value;
      if (_bufferValue < 0) {
        return 0;
      }

      if (_bufferValue > 100) {
        return 100;
      }

      return _bufferValue;
    });

    const backgroundStyle = computed(() => {
      const _backgroundOpacity =
        backgroundOpacity.value == null ? 0.3 : backgroundOpacity.value;

      return {
        height: active.value ? convertToUnit(height.value) : 0,
        opacity: _backgroundOpacity,
        width: `${normalizedBufer.value}%`,
      };
    });

    const normalizedValue = computed(() => {
      const _value = value.value;
      if (_value < 0) {
        return 0;
      }

      if (_value > 100) {
        return 100;
      }

      return _value;
    });

    const effectiveWidth = computed(() => {
      const _normalizedBufer = normalizedBufer.value;
      if (!_normalizedBufer) {
        return 0;
      }

      return (+normalizedValue.value * 100) / +_normalizedBufer;
    });

    const styles = computed(() => {
      const styles: CSSProperties = {};

      if (!active.value) {
        styles.height = 0;
      }

      const _normalizedBufer = normalizedBufer.value;

      if (!indeterminate.value && _normalizedBufer !== 100) {
        styles.width = `${_normalizedBufer}%`;
      }

      return styles;
    });

    function genDeterminate() {
      return (
        <div
          class={[
            'v-progress-linear__bar__determinate' /*, colorClasses.value*/,
          ]}
          style={{
            width: `${effectiveWidth.value}%`,
            // backgroundColor: this.color,
          }}
          ref="front"
        />
      );
    }

    function genBar(name: string) {
      return (
        <div
          class={[
            'v-progress-linear__bar__indeterminate',
            name,
            // colorClasses.value,
          ]}
          // staticClass="progress-linear__bar__indeterminate"
          // class={{
          //   [name]: true,
          //   ...this.colorClasses,
          // }}
          // style={{
          //   backgroundColor: this.color,
          // }}
        />
      );
    }

    function genIndeterminate() {
      return (
        <div
          class={[
            'v-progress-linear__bar__indeterminate',
            {
              'v-progress-linear__bar__indeterminate--active': active.value,
            },
          ]}
          ref="front">
          {[genBar('long'), genBar('short')]}
        </div>
      );
    }

    return () => {
      const _indeterminate = indeterminate.value;
      const fade = (
        <Transition name="vv-stack-fade">
          {_indeterminate ? [genIndeterminate()] : []}
        </Transition>
      );

      const slide = (
        <Transition name="vv-stack-slide-x">
          {_indeterminate ? [] : [genDeterminate()]}
        </Transition>
      );

      const bar = (
        <div class="v-progress-linear__bar" style={styles.value}>
          {[fade, slide]}
        </div>
      );

      const background = (
        <div
          class={['v-progress-linear__background' /*, colorClasses.value*/]}
          // class={this.colorClasses}
          style={{
            ...backgroundStyle.value,
            // backgroundColor: this.backgroundColor || this.color,
          }}
        />
      );

      const content = ctx.slots.default && (
        <div class="v-progress-linear__content">{ctx.slots.default}</div>
      );

      const colorClass = useScopeColorClass(props);

      return (
        <div
          class={[
            'v-progress-linear',
            colorClass.value.className,
            {
              'v-progress-linear--query': query.value,
              'v-progress-linear--has-color': !!colorClass.value.value,
            },
          ]}
          style={{
            height: convertToUnit(height.value),
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={normalizedBufer.value}
          aria-valuenow={_indeterminate ? undefined : normalizedValue.value}
          // on={this.$listeners}
        >
          {[background, bar, content]}
        </div>
      );
      // const info = h(
      //   'span',
      //   { class: 'v-progress-circular__info' },
      //   renderSlotOrEmpty(ctx.slots, 'default'),
      // );

      // const svg = genSvg();

      // return (
      //   <span
      //     class={['v-progress-circular', classes.value]}
      //     style={styles.value}
      //     role="progressbar"
      //     aria-valuemin="0"
      //     aria-valuemax="100"
      //     aria-valuenow={
      //       indeterminate.value ? undefined : normalizedValue.value
      //     }>
      //     {svg}
      //     {info}
      //   </span>
      // );
    };
  },
});

function convertToUnit(
  str: string | number | null | undefined,
  unit = 'px',
): string | undefined {
  if (str == null || str === '') {
    return undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } else if (isNaN(+str!)) {
    return String(str);
  } else {
    return `${Number(str)}${unit}`;
  }
}

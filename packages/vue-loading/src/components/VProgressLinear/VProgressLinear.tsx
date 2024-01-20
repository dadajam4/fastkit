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

    const normalizedBuffer = computed(() => {
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
        width: `${normalizedBuffer.value}%`,
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
      const _normalizedBuffer = normalizedBuffer.value;
      if (!_normalizedBuffer) {
        return 0;
      }

      return (+normalizedValue.value * 100) / +_normalizedBuffer;
    });

    const styles = computed(() => {
      const _styles: CSSProperties = {};

      if (!active.value) {
        _styles.height = 0;
      }

      const _normalizedBuffer = normalizedBuffer.value;

      if (!indeterminate.value && _normalizedBuffer !== 100) {
        _styles.width = `${_normalizedBuffer}%`;
      }

      return _styles;
    });

    function genDeterminate() {
      return (
        <div
          class={[
            'v-progress-linear__bar__determinate' /* , colorClasses.value */,
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
          class={['v-progress-linear__background']}
          style={backgroundStyle.value}
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
          aria-valuemax={normalizedBuffer.value}
          aria-valuenow={_indeterminate ? undefined : normalizedValue.value}
          // on={this.$listeners}
        >
          {[background, bar, content]}
        </div>
      );
    };
  },
});

function convertToUnit(
  str: string | number | null | undefined,
  unit = 'px',
): string | undefined {
  if (str == null || str === '') {
    return undefined;
  }
  if (isNaN(+str!)) {
    return String(str);
  }
  return `${Number(str)}${unit}`;
}

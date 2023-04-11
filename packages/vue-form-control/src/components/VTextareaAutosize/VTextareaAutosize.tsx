import {
  defineComponent,
  computed,
  ref,
  Fragment,
  reactive,
  watch,
  watchEffect,
} from 'vue';
import {
  BooleanishPropOption,
  NumberishPropOption,
  resolveNumberish,
} from '@fastkit/vue-utils';
import { ownerWindow } from '@fastkit/dom';
import { debounce } from '@fastkit/debounce';
import { logger } from '../../logger';

function getStyleValue(
  computedStyle: CSSStyleDeclaration,
  property: keyof CSSStyleDeclaration,
) {
  return parseInt(computedStyle[property] as any, 10) || 0;
}

export interface VTextareaAutosizeRef {
  value: string;
  focus(opts?: FocusOptions): void;
  blur(): void;
}

export const VTextareaAutosize = defineComponent({
  name: 'VTextareaAutosize',
  inheritAttrs: false,
  props: {
    autocomplete: String,
    autofocus: BooleanishPropOption,
    disabled: BooleanishPropOption,
    form: String,
    maxlength: NumberishPropOption,
    minlength: NumberishPropOption,
    name: String,
    placeholder: String,
    readonly: Boolean,
    required: BooleanishPropOption,
    // rows: NumberishPropOption,
    modelValue: {
      type: String,
      default: '',
    },
    minRows: NumberishPropOption,
    maxRows: NumberishPropOption,
  },
  emits: {
    input: (event: Event) => true,
    'update:modelValue': (modelValue: string) => true,
    focus: (event: FocusEvent) => true,
    blur: (event: FocusEvent) => true,
  },
  setup(props, ctx) {
    const inputRef = ref<HTMLTextAreaElement | null>(null);
    const shadowRef = ref<HTMLTextAreaElement | null>(null);
    const currentValue = ref(props.modelValue);
    const minRows = computed(() => resolveNumberish(props.minRows, 1));
    const maxRows = computed(() => resolveNumberish(props.maxRows));
    const placeholder = computed(() => props.placeholder);
    const renders = ref(0);
    const state = reactive<{
      fallbackRows?: number;
      overflow?: boolean;
      outerHeightStyle?: number;
    }>({
      fallbackRows: minRows.value,
    });
    const value = computed({
      get: () => currentValue.value,
      set: (value) => {
        if (currentValue.value !== value) {
          currentValue.value = value;
          ctx.emit('update:modelValue', value);
        }
      },
    });

    const syncHeight = () => {
      const input = inputRef.value;
      if (!input) return;

      const containerWindow = ownerWindow(input);
      const computedStyle = containerWindow.getComputedStyle(input);

      // If input's width is shrunk and it's not visible, don't sync height.
      if (computedStyle.width === '0px') {
        return;
      }

      const inputShallow = shadowRef.value;
      if (!inputShallow) return;

      inputShallow.style.width = computedStyle.width;
      inputShallow.value = input.value || placeholder.value || 'x';
      if (inputShallow.value.slice(-1) === '\n') {
        // Certain fonts which overflow the line height will cause the textarea
        // to report a different scrollHeight depending on whether the last line
        // is empty. Make it non-empty to avoid this issue.
        inputShallow.value += ' ';
      }
      const boxSizing = computedStyle.boxSizing;
      const padding =
        getStyleValue(computedStyle, 'paddingBottom') +
        getStyleValue(computedStyle, 'paddingTop');
      const border =
        getStyleValue(computedStyle, 'borderBottomWidth') +
        getStyleValue(computedStyle, 'borderTopWidth');

      // The height of the inner content
      const innerHeight = inputShallow.scrollHeight;

      // Measure height of a textarea with a single row
      inputShallow.value = 'x';
      const singleRowHeight = inputShallow.scrollHeight;

      // The height of the outer content
      let outerHeight = innerHeight;

      if (minRows.value) {
        outerHeight = Math.max(
          Number(minRows.value) * singleRowHeight,
          outerHeight,
        );
      }
      if (maxRows.value) {
        outerHeight = Math.min(
          Number(maxRows.value) * singleRowHeight,
          outerHeight,
        );
      }
      outerHeight = Math.max(outerHeight, singleRowHeight);

      // Take the box sizing into account for applying this value as a style.
      const outerHeightStyle =
        outerHeight + (boxSizing === 'border-box' ? padding + border : 0);
      const overflow = Math.abs(outerHeight - innerHeight) <= 1;

      if (
        renders.value < 20 &&
        ((outerHeightStyle > 0 &&
          Math.abs((state.outerHeightStyle || 0) - outerHeightStyle) > 1) ||
          state.overflow !== overflow)
      ) {
        renders.value++;
        state.overflow = overflow;
        state.outerHeightStyle = outerHeightStyle;
        state.fallbackRows = undefined;
        return;
      }

      if (__PLUGBOY_DEV__) {
        if (renders.value === 20) {
          logger.error(
            [
              'vue-form-control: Too many re-renders. The layout is unstable.',
              'VTextareaAutosize limits the number of renders to prevent an infinite loop.',
            ].join('\n'),
          );
        }
      }
    };

    watch(
      [() => minRows.value, () => maxRows.value, () => props.placeholder],
      syncHeight,
    );

    watchEffect(() => {
      const input = inputRef.value;
      if (!input) return;
      const handleResize = debounce(() => {
        renders.value = 0;
        syncHeight();
      });
      const containerWindow = ownerWindow(input);
      containerWindow.addEventListener('resize', handleResize);
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(input);

      return () => {
        handleResize.clear();
        containerWindow.removeEventListener('resize', handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    });

    watch([() => props.modelValue], () => {
      renders.value = 0;
    });

    const handleInput = (event: Event) => {
      renders.value = 0;
      value.value = (event.target as HTMLTextAreaElement).value;

      syncHeight();

      ctx.emit('input', event);
    };

    const focus = (opts?: FocusOptions) => {
      const input = inputRef.value;
      if (!input) return;
      input.focus(opts);
    };

    const blur = () => {
      const input = inputRef.value;
      if (!input) return;
      input.blur();
    };

    return {
      value,
      handleInput,
      inputRef: () => inputRef,
      shadowRef: () => shadowRef,
      state,
      focus,
      blur,
    };
  },
  render() {
    return (
      <Fragment>
        <textarea
          {...this.$attrs}
          value={this.value}
          onInput={this.handleInput}
          autocomplete={this.autocomplete}
          autofocus={this.autofocus}
          disabled={this.disabled}
          form={this.form}
          maxlength={this.maxlength}
          minlength={this.minlength}
          name={this.name}
          placeholder={this.placeholder}
          readonly={this.readonly}
          required={this.required}
          rows={this.state.fallbackRows}
          ref={this.inputRef()}
          style={{
            ...(this.$attrs.style as any),

            height: this.state.outerHeightStyle
              ? `${this.state.outerHeightStyle}px`
              : undefined,
            // Need a large enough difference to allow scrolling.
            // This prevents infinite rendering loop.
            overflow: this.state.overflow ? 'hidden' : undefined,
          }}
          onFocus={(ev) => this.$emit('focus', ev)}
          onBlur={(ev) => this.$emit('blur', ev)}
        />
        <textarea
          {...this.$attrs}
          arria-hidden
          readonly
          ref={this.shadowRef()}
          tabindex={-1}
          style={{
            padding: '0',
            // Visibility needed to hide the extra text area on iPads
            visibility: 'hidden',
            // Remove from the content flow
            position: 'absolute',
            // Ignore the scrollbar width
            overflow: 'hidden',
            height: 0,
            top: 0,
            left: 0,
            // Create a new layer, increase the isolation of the computed values
            transform: 'translateZ(0)',
          }}
        />
      </Fragment>
    );
  },
});

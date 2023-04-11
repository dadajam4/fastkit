import { PropType, RendererElement } from 'vue';
import { addTransitionendEvent } from '@fastkit/dom';
import { capitalize } from '@fastkit/helpers';
import { generateJavaScriptTransition } from '../generator';

/**
 * Custom interface of the {@link HTMLElement} to which the {@link VExpandTransition} component is applied
 */
interface HTMLExpandElement extends HTMLElement {
  /** トランジション開始時のスタイルキャッシュ */
  _initialStyle?: {
    transition: string;
    visibility: string | null;
    overflow: string | null;
    height?: string | null;
    width?: string | null;
  };
}

/**
 * Transition components that can be opened and closed
 *
 * @example
 * ```html
 * <script setup>
 * const opened = ref(false);
 * const toggle = () => opened.value = !opened.value;
 * </script>
 *
 * <template>
 *   <button v-on:click="toggle">Toggle</button>
 *   <VExpandTransition>
 *     <div class="target" v-show="opened">
 *       This element is the open/close target.
 *       The css transition property must be set for this element.
 *     </div>
 *   </VExpandTransition>
 * </template>
 *
 * <style>
 * .target {
 *   transition: height .2s;
 * }
 * </style>
 * ```
 */
export const VExpandTransition = generateJavaScriptTransition({
  displayName: 'VExpandTransition',
  props: {
    /**
     * Properties to control opening and closing
     *
     * @default "height"
     */
    expand: {
      type: String as PropType<'width' | 'height'>,
      default: 'height' as const,
    },
  },
  setup(props) {
    const { expand: sizeProperty } = props;
    const offsetProperty = `offset${capitalize(sizeProperty)}` as const;

    /**
     * Reset Style
     *
     * @param _el - Element to be reset
     */
    const resetStyles = (_el: RendererElement) => {
      const el = _el as HTMLExpandElement;
      const { _initialStyle } = el;
      if (!_initialStyle) return;
      const size = _initialStyle[sizeProperty];
      el.style.overflow = _initialStyle.overflow || '';
      if (size != null) {
        el.style[sizeProperty] = size;
      }
      delete (el as any)._initialStyle;
    };

    return {
      onBeforeEnter(_el) {
        const el = _el as HTMLExpandElement;
        el._initialStyle = {
          transition: el.style.transition,
          visibility: el.style.visibility,
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty],
        };
      },
      onEnter(_el, done) {
        const el = _el as HTMLExpandElement;

        const initialStyle = el._initialStyle;
        if (!initialStyle) return;
        const offset = `${el[offsetProperty]}px`;

        el.style.setProperty('transition', 'none', 'important');
        el.style.visibility = 'hidden';
        el.style.visibility = initialStyle.visibility || '';
        el.style.overflow = 'hidden';
        el.style[sizeProperty] = '0';

        // eslint-disable-next-line no-void
        void el.offsetHeight; // Force reflow

        el.style.transition = initialStyle.transition;

        requestAnimationFrame(() => {
          addTransitionendEvent(el, done, {
            once: true,
            properties: sizeProperty,
          });
          el.style[sizeProperty] = offset;
        });
      },
      onAfterEnter: resetStyles,
      onEnterCancelled: resetStyles,
      onLeave(_el, done) {
        const el = _el as HTMLExpandElement;
        el._initialStyle = {
          transition: '',
          visibility: '',
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty],
        };

        el.style.overflow = 'hidden';
        el.style[sizeProperty] = `${el[offsetProperty]}px`;
        // eslint-disable-next-line no-void
        void el.offsetHeight; // Force reflow

        requestAnimationFrame(() => {
          addTransitionendEvent(el, done, {
            once: true,
            properties: sizeProperty,
          });
          el.style[sizeProperty] = '0';
        });
      },
      onAfterLeave: resetStyles,
      onLeaveCancelled: resetStyles,
    };
  },
});

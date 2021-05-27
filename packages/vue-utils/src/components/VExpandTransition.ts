import { PropType, RendererElement } from 'vue';
import { createJavaScriptTransition } from '../utils';
import { addTransitionendEvent } from '@fastkit/helpers';

interface HTMLExpandElement extends HTMLElement {
  _parent?: (Node & ParentNode & HTMLElement) | null;
  _initialStyle?: {
    transition: string;
    visibility: string | null;
    overflow: string | null;
    height?: string | null;
    width?: string | null;
  };
}

export const VExpandTransition = createJavaScriptTransition({
  displayName: 'VExpandTransition',
  props: {
    expand: {
      type: String as PropType<'width' | 'height'>,
      default: 'height' as const,
    },
    // className: {
    //   type: String as PropType<string>,
    //   default: 'v-expand-transition' as const,
    // },
  },
  render(props) {
    const { expand: sizeProperty } = props;
    const offsetProperty = `offset${
      sizeProperty.charAt(0).toUpperCase() + sizeProperty.slice(1)
    }` as 'offsetHeight' | 'offsetWidth';

    function resetStyles(_el: RendererElement) {
      const el = _el as HTMLExpandElement;
      const { _initialStyle } = el;
      if (!_initialStyle) return;
      const size = _initialStyle[sizeProperty];
      el.style.overflow = _initialStyle.overflow || '';
      if (size != null) {
        el.style[sizeProperty] = size;
      }
      delete (el as any)._initialStyle;
    }

    function afterLeave(_el: RendererElement) {
      const el = _el as HTMLExpandElement;
      // if (className && el._parent) {
      //   el._parent.classList.remove(className);
      // }
      resetStyles(el);
    }

    return {
      onBeforeEnter(_el) {
        const el = _el as HTMLExpandElement;
        el._parent = el.parentNode as (Node & ParentNode & HTMLElement) | null;
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
        void el.offsetHeight; // force reflow

        el.style.transition = initialStyle.transition;

        // if (className && el._parent) {
        //   el._parent.classList.add(className);
        // }

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
        void el.offsetHeight; // force reflow

        requestAnimationFrame(() => {
          addTransitionendEvent(el, done, {
            once: true,
            properties: sizeProperty,
          });
          el.style[sizeProperty] = '0';
        });
      },
      onAfterLeave: afterLeave,
      onLeaveCancelled: afterLeave,
    };
  },
});

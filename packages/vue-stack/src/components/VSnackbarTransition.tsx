import { nextTick, RendererElement, ExtractPropTypes } from 'vue';
import { ExtractPropInput } from '@fastkit/vue-utils';
import { generateJavaScriptTransition } from '@fastkit/vue-transitions';
import { addTransitionendEvent } from '@fastkit/dom';

const HORIZONTAL_MARGIN = 24;
const SAFE_TIMEOUT = 1000;

const getHeight = (el: HTMLElement): Promise<number> => {
  const { height } = el.getBoundingClientRect();
  if (height) return Promise.resolve(height);
  return new Promise((resolve) => {
    nextTick(() => {
      resolve(el.getBoundingClientRect().height);
    });
  });
};

export const stackSnackbarTransitionProps = {
  top: Boolean,
  bottom: Boolean,
  left: Boolean,
  right: Boolean,
};

export type VSnackbarTransitionProps = ExtractPropInput<
  typeof stackSnackbarTransitionProps
>;

export type VSnackbarTransitionResolvedProps = ExtractPropTypes<
  typeof stackSnackbarTransitionProps
>;

export const VSnackbarTransition = generateJavaScriptTransition({
  displayName: 'VSnackbarTransition',
  props: stackSnackbarTransitionProps,
  setup(props) {
    const { top, left, right } = props;
    const hasHorizontal = left || right;
    const marginProp = top ? 'marginTop' : 'marginBottom';
    let safeTimer: number | null = null;

    const setOffset = (
      el: HTMLElement,
      disableTransition = false,
    ): Promise<void> => {
      return new Promise((resolve) => {
        getHeight(el).then((height) => {
          let offset = -height;
          if (hasHorizontal) offset -= HORIZONTAL_MARGIN;
          if (!disableTransition) {
            el.style[marginProp] = offset + 'px';
            return resolve();
          }
          el.style.transition = 'none';
          el.style[marginProp] = offset + 'px';
          setTimeout(() => {
            el.style.transition = '';
            setTimeout(resolve, 0);
          }, 30);
        });
      });
    };

    const removeOffset = (
      el: HTMLElement,
      disableTransition = false,
    ): Promise<void> => {
      if (!disableTransition) {
        el.style[marginProp] = '';
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        el.style.transition = 'none';
        el.style[marginProp] = '';
        setTimeout(() => {
          el.style.transition = '';
          setTimeout(resolve, 0);
        }, 0);
      });
    };

    const clearSafeTimer = () => {
      if (safeTimer !== null) {
        clearTimeout(safeTimer);
        safeTimer = null;
      }
    };

    function reset(_el: RendererElement, disableTransition?: boolean) {
      removeOffset(_el as HTMLElement, disableTransition);
      clearSafeTimer();
    }

    return {
      onEnter: (_el, done) => {
        const el = _el as HTMLElement;
        clearSafeTimer();
        safeTimer = window.setTimeout(() => {
          clearSafeTimer();
          done();
        }, SAFE_TIMEOUT);

        const beforeTimer = safeTimer;

        setOffset(el, true).then(() => {
          addTransitionendEvent(
            el,
            () => {
              if (beforeTimer !== safeTimer) return;
              clearSafeTimer();
              done();
            },
            {
              once: true,
              properties: (prop) => prop.indexOf('margin') === 0,
            },
          );
          removeOffset(el);
        });
      },
      onAfterEnter: reset,
      onEnterCancelled: reset,
      onLeave: (_el, done) => {
        const el = _el as HTMLElement;
        clearSafeTimer();
        safeTimer = window.setTimeout(() => {
          clearSafeTimer();
          done();
        }, SAFE_TIMEOUT);

        const beforeTimer = safeTimer;

        setOffset(el).then(() => {
          addTransitionendEvent(
            el,
            () => {
              if (beforeTimer !== safeTimer) return;
              reset(el, true);
              done();
            },
            {
              once: true,
              properties: (prop) => prop.indexOf('margin') === 0,
            },
          );
        });
      },
      onAfterLeave: reset,
      onLeaveCancelled: reset,
    };
  },
});

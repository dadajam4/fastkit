import { nextTick, RendererElement, ExtractPropTypes } from 'vue';
import {
  createJavaScriptTransition,
  ExtractPropInput,
} from '@fastkit/vue-utils';
import { addTransitionendEvent } from '@fastkit/helpers';

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
  // return Promise.resolve(0);
  // return new Promise((resolve) => {
  //   let ticked = 0;

  //   const tick = () => {
  //     const { height } = el.getBoundingClientRect();
  //     if (height) {
  //       resolve(height);
  //     } else {
  //       ticked++;
  //       if (ticked > 0) {
  //         console.log(ticked, height);
  //         return resolve(0);
  //       }
  //       nextTick(tick);
  //     }
  //   };
  //   tick();
  // });
};

export const stackSnackbarTransitionProps = {
  top: Boolean,
  bottom: Boolean,
  left: Boolean,
  right: Boolean,
};

export type VStackSnackbarTransitionProps = ExtractPropInput<
  typeof stackSnackbarTransitionProps
>;

export type VStackSnackbarTransitionResolvedProps = ExtractPropTypes<
  typeof stackSnackbarTransitionProps
>;

export const VStackSnackbarTransition = createJavaScriptTransition({
  displayName: 'VStackSnackbarTransition',
  props: stackSnackbarTransitionProps,
  render(props) {
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

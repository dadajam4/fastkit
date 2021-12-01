import { defineComponent, computed, CSSProperties, ref, nextTick } from 'vue';
import { useVuePageControl } from '../../injections';
import { NumberishPropOption, resolveNumberish } from '@fastkit/vue-utils';

export const VPageProgress = defineComponent({
  name: 'VPageProgress',
  props: {
    color: String,
    failedColor: String,
    height: NumberishPropOption,
    throttle: NumberishPropOption,
    duration: NumberishPropOption,
    continuous: Boolean,
    rtl: Boolean,
  },
  setup(props) {
    useVuePageControl({
      onStart: () => {
        start();
      },
      onFinish: () => {
        finish();
      },
      onError: () => {
        canSucceed.value = false;
      },
    });

    let _timer: number | null = null;
    let _throttle: number | null = null;
    let _cut: number | undefined;
    const show = ref(false);
    const percent = ref(0);
    const skipTimerCount = ref(0);
    const canSucceed = ref(true);
    const throttle = computed(() => resolveNumberish(props.throttle, 200));
    const duration = computed(() => resolveNumberish(props.duration, 3000));
    const reversed = ref(props.rtl);
    const continuous = computed(() => props.continuous);
    const color = computed(() => props.color || 'black');
    const failedColor = computed(() => props.failedColor || 'red');
    const height = computed(() => resolveNumberish(props.height, 2));
    const width = computed(() => {
      return `${percent.value}%`;
    });
    const styles = computed<CSSProperties>(() => {
      return {
        position: 'fixed',
        top: 0,
        left: props.rtl ? 'auto' : 0,
        right: 0,
        zIndex: 999999,
        width: width.value,
        height: `${height.value}px`,
        background: canSucceed.value ? color.value : failedColor.value,
        opacity: 1,
        // transition: `width ${duration.value}ms`,
        transition: `width 0.1s, opacity 0.4s`,
      };
    });

    function clear() {
      _timer !== null && clearInterval(_timer);
      _throttle !== null && clearTimeout(_throttle);
      _timer = null;
    }

    // function set(num: number) {
    //   show.value = true;
    //   canSucceed.value = true;
    //   percent.value = Math.min(100, Math.max(0, Math.floor(num)));
    // }

    function increase(num: number) {
      percent.value = Math.min(100, Math.floor(percent.value + num));
    }

    function decrease(num: number) {
      percent.value = Math.max(0, Math.floor(percent.value - num));
    }

    // function pause() {
    //   _timer !== null && window.clearInterval(_timer);
    // }

    // function resume() {
    //   startTimer();
    // }

    function finish() {
      percent.value = reversed.value ? 0 : 100;
      hide();
    }

    function hide() {
      clear();
      window.setTimeout(() => {
        show.value = false;
        nextTick(() => {
          percent.value = 0;
          reversed.value = false;
        });
      }, 500);
    }

    // function fail(error: unknown) {
    //   canSucceed.value = false;
    // }

    function start() {
      clear();
      percent.value = 0;
      reversed.value = false;
      skipTimerCount.value = 0;
      canSucceed.value = true;
      if (throttle.value) {
        _throttle = window.setTimeout(() => startTimer(), throttle.value);
      } else {
        startTimer();
      }
    }

    function startTimer() {
      if (!show.value) {
        show.value = true;
      }

      _timer = window.setInterval(() => {
        if (typeof _cut === 'undefined') {
          _cut = 10000 / Math.floor(duration.value);
        }

        if (skipTimerCount.value > 0) {
          skipTimerCount.value--;
          return;
        }

        if (reversed.value) {
          decrease(_cut);
        } else {
          increase(_cut);
        }

        if (continuous.value && (percent.value >= 100 || percent.value <= 0)) {
          skipTimerCount.value = 1;
          reversed.value = !reversed.value;
        }
      }, 100);
    }

    return () => {
      if (!show.value) return;
      return <div class="v-page-progress" style={styles.value} />;
    };
  },
});

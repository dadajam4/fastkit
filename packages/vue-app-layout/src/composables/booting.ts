import * as styles from './booting.css';
import { onMounted, ref, nextTick } from 'vue';
import { tokens, extractTokenName } from '../styles';

const DURATION_TOKEN_NAME = extractTokenName(tokens.transition.duration);
const DURATION_PARSE_RE = /(\d+)(m?s)/;

let initialMounted = false;

function getTransitionDuration(): number {
  const value =
    getComputedStyle(document.documentElement).getPropertyValue(
      DURATION_TOKEN_NAME,
    ) || '0';

  const parsed = value.match(DURATION_PARSE_RE);
  if (!parsed) return 0;

  const amount = parsed[1];
  const unit = parsed[2] || 'ms';
  const unitAmount = unit === 'ms' ? 1 : 1000;
  return parseFloat(amount) * unitAmount;
}

export function useBooting() {
  const booting = ref(initialMounted);

  onMounted(() => {
    const duration = getTransitionDuration();

    setTimeout(() => {
      booting.value = false;
    }, duration);

    nextTick(() => {
      initialMounted = true;
    });
  });

  return {
    get booting() {
      return booting.value;
    },
    get styles() {
      return booting.value ? styles.booting : undefined;
    },
  };
}

import './VTextCounter.scss';
import { defineComponent } from 'vue';

export const VTextCounter = defineComponent({
  name: 'VTextCounter',
  props: {
    length: {
      type: Number,
      required: true,
    },
    maxlength: {
      type: Number,
      required: true,
    },
  },
  render() {
    return (
      <span class="v-text-counter">{`${this.length} / ${this.maxlength}`}</span>
    );
  },
});

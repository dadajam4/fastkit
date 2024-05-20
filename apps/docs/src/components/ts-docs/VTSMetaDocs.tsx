import { MetaDoc } from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType } from 'vue';
import { VTSMetaDoc } from './VTSMetaDoc';

export const VTSMetaDocs = defineComponent({
  name: 'VTSMetaDocs',
  props: {
    value: {
      type: Array as PropType<MetaDoc[]>,
      default: () => [],
    },
  },
  setup(props) {
    return () => (
      <div class="VTSMetaDocs">
        {props.value.map((doc, index) => (
          <VTSMetaDoc value={doc} key={index} />
        ))}
      </div>
    );
  },
});

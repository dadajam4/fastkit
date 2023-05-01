import { SignatureMeta } from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType } from 'vue';
import { VTSSignatureMeta } from './VTSSignatureMeta';

export const VTSSignaturesMeta = defineComponent({
  name: 'VTSSignaturesMeta',
  props: {
    value: {
      type: Array as PropType<SignatureMeta[]>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const signatures = props.value;
      return (
        <div class="VTSSignaturesMeta">
          {signatures.map((signature, index) => (
            <VTSSignatureMeta
              key={`${index}:${signature.name}`}
              value={signature}
              index={index}
              total={signatures.length}
            />
          ))}
        </div>
      );
    };
  },
});

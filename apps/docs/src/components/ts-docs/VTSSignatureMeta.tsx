import { SignatureMeta } from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType } from 'vue';
import { VCode } from '~/components';
import { VTSMetaDocs } from './VTSMetaDocs';
import { VTSParameterTable } from './VTSParameterTable';
import * as styles from './VTSSignatureMeta.css';

export const VTSSignatureMeta = defineComponent({
  name: 'VTSSignatureMeta',
  props: {
    value: {
      type: Object as PropType<SignatureMeta>,
      required: true,
    },
    index: Number,
    total: Number,
  },
  setup(props) {
    return () => {
      const meta = props.value;
      const { returnType } = meta;
      const { index, total } = props;

      const count =
        total !== undefined && total > 1 && index !== undefined
          ? `(${index + 1} / ${total})`
          : '';

      return (
        <div class="VTSSignatureMeta mt-2 pb-2">
          <h5 class={styles.signatureTitle}>
            <span class={styles.signatureTitle}># Signature</span>

            {!!count && <span class={styles.signatureTitleCount}>{count}</span>}
          </h5>

          {meta.text && <VCode code={meta.text} language="typescript" />}
          {meta.docs && <VTSMetaDocs value={meta.docs} />}

          <h5 class="mt-3"># Parameters</h5>
          <div>
            <VTSParameterTable value={meta.parameters} />
          </div>

          <h5># Return Type</h5>
          <div style={{ fontSize: '80%' }}>
            <div>
              <code>{returnType.text}</code>
            </div>
            {returnType.docs.length > 0 && (
              <VTSMetaDocs value={returnType.docs} />
            )}
          </div>
        </div>
      );
    };
  },
});

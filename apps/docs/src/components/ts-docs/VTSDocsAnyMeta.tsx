import { AnyMeta } from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType, computed } from 'vue';
import { VTSMetaDocs } from './VTSMetaDocs';
import { VDocsSection, VCode } from '~/components';
import { normalizeMeta, MetaInfo } from './schemes';
import { ScopeName, ColorVariant, VChip } from '@fastkit/vui';
import { VTSSignaturesMeta } from './VTSSignaturesMeta';

interface ChipInfo {
  text: string;
  color?: ScopeName;
  variant?: ColorVariant;
}

export const VTSDocsAnyMeta = defineComponent({
  name: 'VTSDocsAnyMeta',
  props: {
    value: {
      type: Object as PropType<AnyMeta | MetaInfo>,
      required: true,
    },
  },
  setup(props) {
    const infoRef = computed(() => normalizeMeta(props.value));
    const chipsRef = computed<ChipInfo[] | undefined>(() => {
      const { type, property } = infoRef.value;
      if (!type && !property) return;

      const chips: ChipInfo[] = [];
      if (type) {
        chips.push({
          text: type,
          color: type === 'function' ? 'accent' : 'mono',
        });
      }
      if (property?.static) {
        chips.push({
          text: 'static',
          color: 'accent',
          variant: 'outlined',
        });
      }
      if (property?.readonly) {
        chips.push({
          text: 'readonly',
          color: 'base',
          variant: 'outlined',
        });
      }
      if (property?.optional) {
        chips.push({
          text: 'optional',
          color: 'base',
          variant: 'outlined',
        });
      }
      return chips;
    });

    return () => {
      const info = infoRef.value;
      const chips = chipsRef.value;

      return (
        <VDocsSection
          class="VTSDocsAnyMeta"
          title={info.name}
          suffix={
            chips
              ? () =>
                  chips.map((chip) => (
                    <VChip
                      class="ml-1"
                      variant={chip.variant}
                      color={chip.color}
                      size="xs">
                      {chip.text}
                    </VChip>
                  ))
              : undefined
          }
          notranslateTitle>
          {info.text && <VCode code={info.text} language="typescript" />}
          {info.docs && <VTSMetaDocs value={info.docs} />}

          {info.constructors && (
            <VTSSignaturesMeta key="constructors" value={info.constructors} />
          )}

          {info.signatures && (
            <VTSSignaturesMeta key="constructors" value={info.signatures} />
          )}

          {info.properties && (
            <div class="pl-4">
              {info.properties.map((property, index) => (
                <VTSDocsAnyMeta
                  key={`${property.name}:${index}`}
                  value={property}
                />
              ))}
            </div>
          )}

          {info.staticMembers && (
            <div class="pl-4">
              {info.staticMembers.map((property, index) => (
                <VTSDocsAnyMeta
                  key={`${property.name}:${index}`}
                  value={property}
                />
              ))}
            </div>
          )}
          {/* {props.dump && properties.value && (
            <div class="pl-4">
              {properties.value.map(([name, meta], index) => {
                return <VTSDocsObjectMemberMeta key={name} value={meta} />;
              })}
            </div>
          )} */}
        </VDocsSection>
      );
    };
  },
});

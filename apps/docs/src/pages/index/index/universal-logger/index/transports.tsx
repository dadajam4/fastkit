import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, VDocsPaging, VTSDocsAnyMeta } from '~/components';
import { PackageProvide } from '@@/package-loader';
import { ApiMeta } from '../-shared';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead({
      title: 'Builtin Transports',
    });

    const meta = ApiMeta.use();

    return () => {
      return (
        <div>
          <VHero>Builtin Transports</VHero>

          <VDocsSection title="Console">
            <VTSDocsAnyMeta value={meta.types.ConsoleTransportMeta} />
            <VTSDocsAnyMeta value={meta.types.ConsoleTransportSettingsMeta} />
          </VDocsSection>

          <VDocsSection title="Standard output">
            <VTSDocsAnyMeta value={meta.types.STDOTransportMeta} />
            <VTSDocsAnyMeta value={meta.types.STDOTransportSettingsMeta} />
          </VDocsSection>

          <VDocsSection title="Datadog">
            <VTSDocsAnyMeta value={meta.types.DDTransportMeta} />
            <VTSDocsAnyMeta value={meta.types.DDTransportSettingsMeta} />
          </VDocsSection>

          <VDocsPaging
            prev={{
              to: `/universal-logger/transformers/`,
              title: 'Transformers',
            }}
          />
        </div>
      );
    };
  },
});

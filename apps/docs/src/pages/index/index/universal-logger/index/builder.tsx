import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { PackageProvide } from '@@/package-loader';
import { VDocsSection, VDocsPaging, VTSDocsAnyMeta } from '~/components';
import { ApiMeta } from '../-shared';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead({
      title: 'Builder API',
    });

    const meta = ApiMeta.use();

    return () => (
      <div>
        <VHero>Builder API</VHero>

        <VDocsSection title="Builder">
          <VTSDocsAnyMeta value={meta.types.loggerBuilderMeta} />
          <VTSDocsAnyMeta value={meta.types.LoggerBuilderOptionsMeta} />
          <VTSDocsAnyMeta value={meta.types.LoggerBuilderResultMeta} />
        </VDocsSection>

        <VDocsSection title="Logger">
          <VTSDocsAnyMeta value={meta.types.LoggerMeta} />
        </VDocsSection>

        <VDocsSection title="Schemes">
          <VTSDocsAnyMeta value={meta.types.LogLevelMeta} />
          <VTSDocsAnyMeta value={meta.types.LogLevelThresholdMeta} />
          <VTSDocsAnyMeta value={meta.types.LoggerOptionsMeta} />
          <VTSDocsAnyMeta value={meta.types.LoggerPayloadMeta} />
          <VTSDocsAnyMeta value={meta.types.TransformerMeta} />
          <VTSDocsAnyMeta value={meta.types.TransportFuncMeta} />
          <VTSDocsAnyMeta value={meta.types.TransportMeta} />
        </VDocsSection>

        <VDocsPaging
          prev={{
            to: `/universal-logger/`,
            title: 'HOME',
          }}
          next={{
            to: `/universal-logger/transformers/`,
            title: 'Transformers',
          }}
        />
      </div>
    );
  },
});

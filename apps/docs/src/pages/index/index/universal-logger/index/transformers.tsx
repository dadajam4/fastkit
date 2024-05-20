import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { PackageProvide } from '@@/package-loader';
import { VDocsSection, VDocsPaging, VTSDocsAnyMeta } from '~/components';
import { ApiMeta } from '../-shared';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead({
      title: 'Builtin Transformers',
    });

    const meta = ApiMeta.use();

    return () => (
      <div>
        <VHero>Builtin Transformers</VHero>

        <VDocsSection title="Sanitizer">
          <VTSDocsAnyMeta value={meta.types.SanitizerTransformerMeta} />
          <VTSDocsAnyMeta value={meta.types.SanitizerOptionsMeta} />
        </VDocsSection>

        <VDocsSection title="Clone">
          <VTSDocsAnyMeta value={meta.types.CloneOptionsMeta} />
          <VTSDocsAnyMeta value={meta.types.CloneTransformerMeta} />
        </VDocsSection>

        <VDocsPaging
          prev={{
            to: `/universal-logger/builder/`,
            title: 'Builder API',
          }}
          next={{
            to: `/universal-logger/transports/`,
            title: 'Transports',
          }}
        />
      </div>
    );
  },
});

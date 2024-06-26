import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:color-scheme';
import { i18n } from '@@/i18n';
import { VDocsSection, VCode } from '~/components';
import { pkg } from './-i18n';

const PkgI18nSubSpace = i18n.defineSubSpace({ pkg });

export default defineComponent({
  i18n: PkgI18nSubSpace,
  setup() {
    const pkgI18n = PkgI18nSubSpace.use();
    const { common } = pkgI18n.at;

    return () => (
      <VPackageProvider
        v-slots={{
          // eslint-disable-next-line no-shadow
          default: ({ pkg }) => (
            <>
              {pkg.renderHeader()}
              <VDocsSection title={common.t.usage}>
                <VCode language="ts">
                  {`// ${common.t.docIsInPreparation}`}
                </VCode>
              </VDocsSection>
            </>
          ),
        }}
      />
    );
  },
});

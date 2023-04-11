import { defineComponent } from 'vue';
import { Home } from './-i18n';
import { i18n } from '@@';
import { VPackageHome } from '~/components';

const I18nSubSpace = i18n.defineSubSpace({ Home });

export default defineComponent({
  i18n: I18nSubSpace,
  setup() {
    const subSpace = I18nSubSpace.use();

    return () => {
      return (
        <VPackageHome
          name="Fastkit"
          logo={`${import.meta.env.BASE_URL}logo.svg`}
          description={subSpace.at.Home.trans.lead}
          title={`Fastkit - ${subSpace.at.Home.trans.lead}`}
          github="https://github.com/dadajam4/fastkit"
          actions={[
            {
              to: '/guide/',
              color: 'primary',
              startIcon: 'mdi-compass',
              label: subSpace.at.common.t.tryItOut,
            },
            {
              to: '/guide/what/',
              color: 'primary',
              variant: 'outlined',
              label: subSpace.at.common.t.whatIsFastkit,
            },
          ]}
        />
      );
    };
  },
});

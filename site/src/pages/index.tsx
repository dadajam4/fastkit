import './index.scss';

import { defineComponent } from 'vue';
import {
  VButton,
  VAppContainer,
  VGridContainer,
  VGridItem,
  VBusyImage,
} from '@fastkit/vui';
import { Top } from './-i18n';
import { i18n } from '~/i18n';
import { useHead } from '@vueuse/head';

const I18nSubSpace = i18n.defineSubSpace({ Top });

export default defineComponent({
  i18n: I18nSubSpace,
  setup(props, ctx) {
    const subSpace = I18nSubSpace.use();
    useHead({
      title: `fastkit - ${subSpace.at.Top.trans.lead}`,
    });

    return () => {
      return (
        <div class="pg-home">
          <VAppContainer>
            <div class="text-center">
              <VBusyImage
                class="pg-home__logo"
                src={`${import.meta.env.BASE_URL}logo.svg`}
                alt=""
                width={120}
                height={120}
              />
              <h1 class="pg-home__title docs-theme-font">fastkit</h1>
              <p class="pg-home__lead">
                <>{subSpace.at.Top.trans.lead}</>
              </p>

              {/* <div>
                {subSpace.locales.map((locale) => (
                  <VButton
                    key={locale.name}
                    onClick={() => subSpace.space.setLocale(locale.name)}
                    loading={locale.name === subSpace.space.nextLocaleName}
                    disabled={locale.name === subSpace.space.currentLocaleName}>
                    {locale.meta.displayName}
                  </VButton>
                ))}
              </div> */}

              <VGridContainer
                spacing={2}
                alignContent={'center'}
                justifyContent={'center'}>
                <VGridItem>
                  <VButton
                    class="pg-home__action"
                    to="/getting-started"
                    color="primary"
                    size="lg"
                    startIcon={'mdi-compass'}>
                    {subSpace.at.common.t.getStarted}
                  </VButton>
                </VGridItem>
                <VGridItem>
                  <VButton
                    class="pg-home__action"
                    color="secondary"
                    size="lg"
                    startIcon={'mdi-github'}
                    href="https://github.com/dadajam4/fastkit"
                    target="_blank">
                    GitHub
                  </VButton>
                </VGridItem>
              </VGridContainer>
            </div>
          </VAppContainer>
        </div>
      );
    };
  },
});

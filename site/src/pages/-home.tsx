import './-home.scss';

import { defineComponent } from 'vue';
import {
  VButton,
  VAppContainer,
  VGridContainer,
  VGridItem,
  VBusyImage,
} from '@fastkit/vui';
import { Home } from './-i18n';
import { i18n } from '~/i18n';
import { useHead } from '@vueuse/head';
import { VLanguageSwitcher } from '~/components';

const I18nSubSpace = i18n.defineSubSpace({ Home });

export default defineComponent({
  i18n: I18nSubSpace,
  setup(props, ctx) {
    const subSpace = I18nSubSpace.use();

    useHead({
      title: `fastkit - ${subSpace.at.Home.trans.lead}`,
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
                <>{subSpace.at.Home.trans.lead}</>
              </p>

              <VLanguageSwitcher class="pg-home__languages" inline />

              <VGridContainer
                spacing={2}
                alignContent={'center'}
                justifyContent={'center'}>
                <VGridItem>
                  <VButton
                    class="pg-home__action"
                    to="/guide/"
                    color="primary"
                    size="lg"
                    startIcon={'mdi-compass'}>
                    {subSpace.at.common.t.tryItOut}
                  </VButton>
                </VGridItem>
                <VGridItem>
                  <VButton
                    class="pg-home__action"
                    to="/guide/what/"
                    color="primary"
                    variant="outlined"
                    size="lg">
                    {subSpace.at.common.t.whatIsFastkit}
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

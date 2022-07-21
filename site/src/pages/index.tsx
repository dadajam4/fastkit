import './index.scss';

import { defineComponent } from 'vue';
import {
  VButton,
  VAppContainer,
  VGridContainer,
  VGridItem,
  VBusyImage,
} from '@fastkit/vui';

export default defineComponent({
  setup(props, ctx) {
    return () => {
      return (
        <div class="pg-home">
          <VAppContainer>
            <div class="text-center">
              <VBusyImage
                class="pg-home__logo"
                src="/logo.svg"
                alt=""
                width={120}
                height={120}
              />
              <h1 class="pg-home__title docs-theme-font">fastkit</h1>
              <p class="pg-home__lead">
                {/* <>
                  すぐにアプリケーションをつくるための、いつものツールキット。
                </> */}
                <>A toolkit for quickly creating applications.</>
              </p>
              {/** A toolkit for quickly creating applications. */}

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
                    Get Started
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

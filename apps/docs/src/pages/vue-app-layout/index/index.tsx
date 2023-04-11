// import * as styles from './index.css';
import { defineComponent } from 'vue';
import { VPackageHome } from '~/components';
// import {
//   VAppBody,
//   VButton,
//   VLink,
//   VGridContainer,
//   VGridItem,
// } from '@fastkit/vui';
// import { PackageProvide } from '~/composables';
// import { VLanguageSwitcher } from '~/components';

export default defineComponent({
  setup() {
    // const pkg = PackageProvide.use();

    return () => {
      return (
        <VPackageHome
          actions={[
            {
              color: 'primary',
              to: '/vue-app-layout/playground/',
              startIcon: 'mdi-seesaw',
              label: 'Playground',
            },
          ]}
        />
        // <VAppBody class={styles.host} center>
        //   <h1 class="docs-theme-font">Vue App Layout</h1>

        //   {/* <VButton to="/vue-app-layout/playground/" startIcon={'mdi-seesaw'}>
        //     Playground
        //   </VButton> */}
        //   <VLanguageSwitcher class={styles.languages} inline />

        //   <VGridContainer
        //     spacing={2}
        //     alignContent={'center'}
        //     justifyContent={'center'}>
        //     <VGridItem>
        //       <VButton
        //         class={styles.action}
        //         to="/vue-app-layout/playground/"
        //         color="primary"
        //         size="lg"
        //         startIcon={'mdi-seesaw'}>
        //         Playground
        //       </VButton>
        //     </VGridItem>
        //     <VGridItem>
        //       <VButton
        //         class={styles.action}
        //         color="secondary"
        //         size="lg"
        //         startIcon={'mdi-github'}
        //         href={pkg.github}
        //         target="_blank">
        //         GitHub
        //       </VButton>
        //     </VGridItem>
        //   </VGridContainer>

        //   <div class={styles.powered}>
        //     Powered by <VLink to="/">Fastkit</VLink>
        //   </div>
        // </VAppBody>
      );
    };
  },
});

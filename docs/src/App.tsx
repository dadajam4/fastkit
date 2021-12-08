import { defineComponent, ref } from 'vue';
import {
  VAppLayout,
  VApp,
  useMediaMatch,
  VAppContainer,
  VToolbar,
  VToolbarTitle,
  VToolbarMenu,
  VButton,
  VDrawerLayout,
  VNavigation,
  VPageLink,
} from '@fastkit/vui';
import { VPage } from '@fastkit/vue-page';
// import { useVuePageControl } from '@fastkit/vue-page';

export const App = defineComponent({
  name: 'App',
  setup() {
    const systemBarOpened = ref(false);
    const requestBackdrop = () => true;
    const mm = useMediaMatch();
    // const page = useVuePageControl();

    return () => (
      <VApp class="v-app">
        <VAppLayout
          header={{ fixed: true }}
          footer={{ spacer: true }}
          // drawer={{ stick: true }}
          drawerStatic={() => mm('lg')}
          onClickBackdrop={(ev, position, control) => {
            if (position === 'systembar') {
              control.releaseBackdrop('systembar', requestBackdrop);
              systemBarOpened.value = false;
            }
          }}
          v-slots={{
            // headerBar: ({ control }) => {
            //   return (
            //     <div
            //       style={{
            //         background: '#ff9800',
            //         width: '100%',
            //         fontSize: '12px',
            //       }}>
            //       <>
            //         システムバーです {JSON.stringify(page.preftechProgress)} →{' '}
            //         {String(page.transitioning)}
            //       </>
            //       <VPageLink to="/hoge">404リンク</VPageLink>
            //       {/* <VSwitch></VSwitch> */}
            //       <input
            //         type="checkbox"
            //         onChange={(ev) => {
            //           console.log(ev);
            //         }}
            //         onFocus={(ev) => {
            //           console.log(ev);
            //         }}
            //       />
            //       <button
            //         type="button"
            //         onClick={() => {
            //           systemBarOpened.value = !systemBarOpened.value;
            //           if (systemBarOpened.value) {
            //             control.requestBackdrop('systembar', requestBackdrop);
            //           } else {
            //             control.releaseBackdrop('systembar', requestBackdrop);
            //           }
            //         }}>
            //         {systemBarOpened.value ? 'close' : 'open'}
            //       </button>
            //     </div>
            //   );
            // },
            header: ({ control }) => {
              return (
                <VToolbar>
                  {!control.drawerIsStatic && (
                    <VToolbarMenu edge="start">
                      <VButton
                        icon="mdi-menu"
                        size="lg"
                        onClick={() => {
                          control.toggleDrawer();
                        }}
                      />
                    </VToolbarMenu>
                  )}
                  <VToolbarTitle>TITLE</VToolbarTitle>
                  <VToolbarMenu edge="end">
                    <VButton icon="mdi-account-circle" size="lg" />
                  </VToolbarMenu>
                </VToolbar>
              );
            },
            default: () => (
              <VAppContainer>
                <VPage />
              </VAppContainer>
            ),
            drawer: () => {
              return (
                <VDrawerLayout
                  color="secondary"
                  v-slots={{
                    header: () => (
                      <VPageLink
                        to="/"
                        style={{
                          background: 'var(--deep-color)',
                          width: '100%',
                          alignSelf: 'stretch',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          color: '#fff',
                        }}>
                        Fastkit
                      </VPageLink>
                    ),
                    footer: () => (
                      <div
                        style={{
                          background: 'var(--deep-color)',
                          width: '100%',
                          alignSelf: 'stretch',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          color: '#fff',
                          height: '100px',
                        }}>
                        FOOTER
                      </div>
                    ),
                  }}
                  // square
                  // style={{
                  //   background: '#222f3c',
                  //   width: '100%',
                  // }}
                >
                  <VNavigation
                    caption="Navigation"
                    items={[
                      {
                        key: 'getting-started',
                        label: 'Getting Started',
                        to: '/getting-started',
                        startIcon: 'mdi-text-box-outline',
                        children: [
                          {
                            key: 'installation',
                            label: 'Installation',
                            to: '/getting-started/installation',
                          },
                          {
                            key: 'usage',
                            label: 'Usage',
                            to: '/getting-started/usage',
                          },
                        ],
                      },
                      {
                        key: 'components',
                        label: 'Components',
                        to: '/components',
                        startIcon: 'mdi-switch',
                        children: [
                          {
                            key: 'buttons',
                            label: 'Buttons',
                            to: '/components/buttons',
                          },
                          {
                            key: 'forms',
                            label: 'Forms',
                            to: '/components/forms',
                          },
                        ],
                      },
                      {
                        key: 'page3',
                        label: 'Page3',
                        to: '/page3',
                        startIcon: 'mdi-switch',
                      },
                      {
                        key: 'settings',
                        label: 'Settings',
                        match: '/settings',
                        startIcon: 'mdi-switch',
                        children: [
                          {
                            key: 'basic',
                            label: 'Basic',
                            to: '/settings/basic',
                          },
                          {
                            key: 'custom',
                            label: 'Custom',
                            to: '/settings/custom',
                          },
                        ],
                      },
                    ]}
                  />

                  <VNavigation
                    caption="Navigation"
                    items={[
                      {
                        key: 'getting-started',
                        label: 'Getting Started',
                        to: '/getting-started',
                        startIcon: 'mdi-text-box-outline',
                        children: [
                          {
                            key: 'installation',
                            label: 'Installation',
                            to: '/getting-started/installation',
                          },
                          {
                            key: 'usage',
                            label: 'Usage',
                            to: '/getting-started/usage',
                          },
                        ],
                      },
                      {
                        key: 'components',
                        label: 'Components',
                        to: '/components',
                        startIcon: 'mdi-switch',
                        children: [
                          {
                            key: 'buttons',
                            label: 'Buttons',
                            to: '/components/buttons',
                          },
                          {
                            key: 'forms',
                            label: 'Forms',
                            to: '/components/forms',
                          },
                        ],
                      },
                      {
                        key: 'page3',
                        label: 'Page3',
                        to: '/page3',
                        startIcon: 'mdi-switch',
                      },
                      {
                        key: 'settings',
                        label: 'Settings',
                        match: '/settings',
                        startIcon: 'mdi-switch',
                        children: [
                          {
                            key: 'basic',
                            label: 'Basic',
                            to: '/settings/basic',
                          },
                          {
                            key: 'custom',
                            label: 'Custom',
                            to: '/settings/custom',
                          },
                        ],
                      },
                    ]}
                  />
                </VDrawerLayout>
              );
            },
            footer: () => {
              return (
                <div
                  style={{
                    background: '#28bebd',
                    padding: '40px 30px',
                    color: '#fff',
                    width: '100%',
                  }}>
                  This is Footer.
                </div>
              );
            },
          }}
        />
      </VApp>
    );
  },
});

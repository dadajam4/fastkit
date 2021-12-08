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
  VPaper,
  VListTile,
  VNavigation,
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
                  <VToolbarTitle>ACCO CMS</VToolbarTitle>
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
                <VPaper
                  color="secondary"
                  square
                  style={{
                    background: '#222f3c',
                    width: '100%',
                  }}>
                  {/* <VListTile startIcon="mdi-comma-box" endIcon="mdi-menu-down">
                    施設管理
                  </VListTile>
                  <VListTile
                    startIcon="mdi-comma-box"
                    endIcon="mdi-menu-down"
                    href="https://google.com">
                    ブランド管理
                  </VListTile>
                  <VListTile
                    startIcon="mdi-account-circle"
                    endIcon={(gen) =>
                      gen({ name: 'mdi-menu-down', rotate: 180 })
                    }
                    type="button">
                    共通設定
                  </VListTile> */}

                  <VNavigation
                    items={[
                      {
                        key: 1,
                        label: 'Getting Started',
                        // to: '/getting-started',
                        startIcon: 'mdi-text-box-outline',
                        children: [
                          {
                            key: 1,
                            label: 'Installation',
                            to: '/getting-started/Installation',
                          },
                          {
                            key: 'usage',
                            label: 'Usage',
                            to: '/getting-started/usage',
                          },
                        ],
                      },
                      {
                        key: 2,
                        label: 'Components',
                        to: '/components',
                        startIcon: 'mdi-switch',
                      },
                      // {
                      //   key: 3,
                      //   label: '共通設定',
                      //   to: '/page3',
                      // },
                    ]}
                  />
                </VPaper>
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

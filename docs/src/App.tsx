import { defineComponent, ref } from 'vue';
import { VAppLayout, VApp, useMediaMatch, VAppContainer } from '@fastkit/vui';
import { VPage } from '@fastkit/vue-page';
import { useVuePageControl, VPageLink } from '@fastkit/vue-page';

export const App = defineComponent({
  name: 'App',
  setup() {
    const systemBarOpened = ref(false);
    const requestBackdrop = () => true;
    const mm = useMediaMatch();
    const page = useVuePageControl();

    return () => (
      <VApp>
        <VAppLayout
          header={{ fixed: true }}
          footer={{ spacer: true }}
          drawer={{ stick: true }}
          drawerStatic={() => mm('lg')}
          onClickBackdrop={(ev, position, control) => {
            if (position === 'systembar') {
              control.releaseBackdrop('systembar', requestBackdrop);
              systemBarOpened.value = false;
            }
          }}
          v-slots={{
            headerBar: ({ control }) => {
              return (
                <div
                  style={{
                    background: '#ff9800',
                    width: '100%',
                    fontSize: '12px',
                  }}>
                  <>システムバーです {JSON.stringify(page.preftechProgress)}</>
                  <VPageLink to="/hoge">404リンク</VPageLink>
                  {/* <VSwitch></VSwitch> */}
                  <input
                    type="checkbox"
                    onChange={(ev) => {
                      console.log(ev);
                    }}
                    onFocus={(ev) => {
                      console.log(ev);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      systemBarOpened.value = !systemBarOpened.value;
                      if (systemBarOpened.value) {
                        control.requestBackdrop('systembar', requestBackdrop);
                      } else {
                        control.releaseBackdrop('systembar', requestBackdrop);
                      }
                    }}>
                    {systemBarOpened.value ? 'close' : 'open'}
                  </button>
                </div>
              );
            },
            header: ({ control }) => {
              return (
                <div
                  style={{
                    background: '#fff',
                    width: '100%',
                    boxShadow: `0 1px 3px 0 rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 2px 1px -1px rgb(0 0 0 / 12%)`,
                  }}>
                  {!control.drawerIsStatic && (
                    <button
                      type="button"
                      onClick={(e) => {
                        control.toggleDrawer();
                      }}>
                      toggle
                    </button>
                  )}
                  あいへお
                </div>
              );
            },
            default: () => (
              <VAppContainer>
                <VPage />
              </VAppContainer>
            ),
            drawer: () => {
              return (
                <div
                  style={{
                    background: '#222f3c',
                    width: '100%',
                  }}>
                  drawer
                </div>
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

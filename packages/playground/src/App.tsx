import { defineComponent, Suspense, ref } from 'vue';
import { RouterView } from 'vue-router';
import { useInjectTheme } from '@fastkit/vue-color-scheme';
import { VStackRoot, VAppLayout } from '@fastkit/vui';
import { mediaQueryService } from './plugins/media-query';

export const App = defineComponent({
  name: 'App',
  setup() {
    useInjectTheme();
    const systemBarOpened = ref(false);
    const requestBackdrop = () => true;
    // const control = VAppLayoutControl.use();
    // control.requestBackdrop('cover', () => systemBarOpened.value);
    return {
      systemBarOpened,
      requestBackdrop,
    };
  },
  render() {
    return (
      <VStackRoot class="app">
        <VAppLayout
          header={{ fixed: true }}
          footer={{ spacer: true }}
          drawer={{ stick: true }}
          drawerStatic={() => mediaQueryService.matches('lg')}
          onClickBackdrop={(ev, position, control) => {
            if (position === 'systembar') {
              control.releaseBackdrop('systembar', this.requestBackdrop);
              this.systemBarOpened = false;
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
                  システムバーです
                  <button
                    type="button"
                    onClick={() => {
                      this.systemBarOpened = !this.systemBarOpened;
                      if (this.systemBarOpened) {
                        control.requestBackdrop(
                          'systembar',
                          this.requestBackdrop,
                        );
                      } else {
                        control.releaseBackdrop(
                          'systembar',
                          this.requestBackdrop,
                        );
                      }
                    }}>
                    {this.systemBarOpened ? 'close' : 'open'}
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
              <Suspense>
                <RouterView />
              </Suspense>
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
          }}></VAppLayout>
      </VStackRoot>
    );
  },
});

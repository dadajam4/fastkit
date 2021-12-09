import './index.scss';
import { defineComponent } from 'vue';
import { VPage } from '@fastkit/vot';
import {
  VAppLayout,
  useMediaMatch,
  VAppContainer,
  VButton,
  VToolbar,
  VToolbarEdge,
  VNavigation,
  VDrawerLayout,
  VPageLink,
  VToolbarMenu,
} from '@fastkit/vui';

export default defineComponent({
  setup() {
    const mm = useMediaMatch();
    return {
      mm,
    };
  },
  render() {
    return (
      <VAppLayout
        class="pg-vui-root"
        header={{ fixed: true }}
        footer={{ spacer: true }}
        // drawer={{ stick: true }}
        drawerStatic={() => this.mm('lg')}
        v-slots={{
          header: ({ control }) => {
            return (
              <VToolbar>
                {!control.drawerIsStatic && (
                  <VToolbarEdge edge="start">
                    <VButton
                      icon="mdi-menu"
                      size="lg"
                      onClick={() => {
                        control.toggleDrawer();
                      }}
                    />
                  </VToolbarEdge>
                )}
                <VToolbarMenu to="/vui">HOME</VToolbarMenu>
                {/* <VToolbarTitle>Vui</VToolbarTitle> */}
                <VToolbarEdge edge="end">
                  <VButton icon="mdi-account-circle" size="lg" />
                </VToolbarEdge>
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
                    <VPageLink class="pg-vui-root__header" to="/vui">
                      Vui
                    </VPageLink>
                  ),
                }}>
                <VNavigation
                  caption="本体に戻る"
                  items={[
                    {
                      key: 'fastkit',
                      label: 'HOME',
                      startIcon: 'mdi-home',
                      to: '/',
                    },
                  ]}
                />

                <VNavigation
                  caption="ドキュメント"
                  items={[
                    {
                      key: 'home',
                      label: 'HOME',
                      to: '/vui',
                      exactMatch: true,
                    },
                    {
                      key: 'components',
                      label: 'Components',
                      // to: '/vui/components',
                      match: '/vui/components',
                      startIcon: 'mdi-toggle-switch-off-outline',
                      children: [
                        {
                          key: 'buttons',
                          label: 'Buttons',
                          to: '/vui/components/buttons',
                        },
                        {
                          key: 'icons',
                          label: 'Icons',
                          to: '/vui/components/icons',
                        },
                        {
                          key: 'loadings',
                          label: 'Loadings',
                          to: '/vui/components/loadings',
                        },
                        {
                          key: 'cards',
                          label: 'Cards',
                          to: '/vui/components/cards',
                        },
                        {
                          key: 'text-fields',
                          label: 'Text fields',
                          to: '/vui/components/text-fields',
                        },
                        {
                          key: 'textareas',
                          label: 'Textareas',
                          to: '/vui/components/textareas',
                        },
                        {
                          key: 'selects',
                          label: 'Selects',
                          to: '/vui/components/selects',
                        },
                        {
                          key: 'checkboxes',
                          label: 'Checkboxes',
                          to: '/vui/components/checkboxes',
                        },
                        {
                          key: 'radio-buttons',
                          label: 'Radio buttons',
                          to: '/vui/components/radio-buttons',
                        },
                        {
                          key: 'switches',
                          label: 'Switches',
                          to: '/vui/components/switches',
                        },
                        {
                          key: 'forms',
                          label: 'Forms',
                          to: '/vui/components/forms',
                        },
                      ],
                    },
                  ]}
                />
              </VDrawerLayout>
            );
          },
        }}
      />
    );
  },
});

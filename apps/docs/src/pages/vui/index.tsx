import './index.scss';
import { defineComponent } from 'vue';
import { VPage, VPageLink } from '@fastkit/vot';
import {
  VAppDrawer,
  VAppToolbar,
  useMediaMatch,
  VAppContainer,
  VButton,
  VToolbar,
  VToolbarEdge,
  VNavigation,
  VDrawerLayout,
  VToolbarMenu,
} from '@fastkit/vui';

export default defineComponent({
  setup() {
    const mediaMatch = useMediaMatch();
    const drawerStatic = () => mediaMatch('lg');

    return () => {
      return (
        <div class="pg-vui-root">
          <VAppToolbar
            v-slots={{
              default: ({ layout }) => (
                <VToolbar>
                  {!layout.drawerIsStatic('left') && (
                    <VToolbarEdge edge="start">
                      <VButton
                        icon="mdi-menu"
                        size="lg"
                        onClick={() => {
                          layout.toggleDrawer();
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
              ),
            }}
          />
          <VAppContainer>
            <VPage />
          </VAppContainer>
          <VAppDrawer
            static={drawerStatic}
            v-slots={{
              default: () => (
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
                        key: 'test',
                        label: 'Test',
                        to: '/vui/test',
                        startIcon: 'mdi-toggle-switch-off-outline',
                        children: [
                          {
                            key: 'child1',
                            label: 'child1',
                            to: '/vui/test/child1',
                          },
                          {
                            key: 'child2',
                            label: 'child2',
                            to: '/vui/test/child2',
                            nested: true,
                            startIcon: 'mdi-toggle-switch-off-outline',
                            children: [
                              {
                                key: 'index',
                                label: 'index',
                                to: '/vui/test/child2',
                                startIcon: 'mdi-toggle-switch-off-outline',
                              },
                              {
                                key: 'child1',
                                label: 'child1',
                                to: '/vui/test/child2/child1',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        key: 'components',
                        label: 'Components',
                        to: '/vui/components',
                        // match: '/vui/components',
                        startIcon: 'mdi-toggle-switch-off-outline',
                        children: [
                          {
                            key: 'usage',
                            label: 'Usage',
                            to: '/vui/components',
                          },
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
                            key: 'avatars',
                            label: 'Avatars',
                            to: '/vui/components/avatars',
                          },
                          {
                            key: 'chips',
                            label: 'Chips',
                            to: '/vui/components/chips',
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
                            key: 'wysiwygs',
                            label: 'Wysiwygs',
                            to: '/vui/components/wysiwygs',
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
                          {
                            key: 'pagination',
                            label: 'Pagination',
                            to: '/vui/components/pagination',
                          },
                          {
                            key: 'data-tables',
                            label: 'Data tables',
                            to: '/vui/components/data-tables',
                          },
                          {
                            key: 'tabs',
                            label: 'Tabs',
                            to: '/vui/components/tabs',
                          },
                          {
                            key: 'breadcrumbs',
                            label: 'Breadcrumbs',
                            to: '/vui/components/breadcrumbs',
                          },
                        ],
                      },
                    ]}
                  />
                </VDrawerLayout>
              ),
            }}
          />
        </div>
      );
    };
  },
});

import './VDocsLayout.scss';

import { defineComponent, PropType } from 'vue';
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
  VBusyImage,
  VTextField,
  VIcon,
  NavigationInput,
  VMenu,
} from '@fastkit/vui';
import { DocsLayoutPackageInfo } from './schemes';
import { DocsPackage } from './docs-package';
import { VLanguageSwitcher } from '../VLanguageSwitcher';

export type DocsLayoutNavigation = NavigationInput & { key?: string | number };

export const VDocsLayout = defineComponent({
  name: 'VDocsLayout',
  props: {
    title: {
      type: String,
      required: true,
    },
    home: {
      type: String,
      required: true,
    },
    package: [String, Object] as PropType<string | DocsLayoutPackageInfo>,
    github: String,
    navigations: {
      type: Array as PropType<DocsLayoutNavigation[]>,
      default: () => [],
    },
  },
  setup(props, ctx) {
    const mediaMatch = useMediaMatch();
    const drawerStatic = () => mediaMatch('lg');
    const pkg = new DocsPackage(props.package, { home: props.home });
    // const packageRef = computed(() =>
    //   resolveDocsLayoutPackageInfo(props.package, { home: props.home }),
    // );

    return () => {
      return (
        <VAppLayout
          class="v-docs-layout"
          header={{ fixed: true }}
          footer={{ spacer: true }}
          // drawer={{ stick: true }}
          drawerStatic={drawerStatic}
          v-slots={{
            header: ({ control }) => {
              return (
                <VToolbar>
                  {!control.drawerIsStatic && (
                    <VToolbarEdge edge="start" class="mr-0">
                      <VButton
                        icon="mdi-menu"
                        size="lg"
                        rounded
                        onClick={() => {
                          control.toggleDrawer();
                        }}
                      />
                    </VToolbarEdge>
                  )}
                  {!control.drawerIsStatic && (
                    <VToolbarMenu to="/" class="v-docs-layout__home">
                      <VBusyImage
                        class="v-docs-layout__home__icon"
                        src="/logo.svg"
                        alt=""
                        width={24}
                        height={24}
                      />
                      <span class="docs-theme-font v-docs-layout__home__label">
                        fastkit
                      </span>
                    </VToolbarMenu>
                  )}
                  <VTextField
                    style={{ marginLeft: 'auto' }}
                    hiddenInfo
                    // placeholder={`${pkg.value.displayName}を検索`}
                    placeholder={`Search ${pkg.displayName}`}
                    startAdornment={() => <VIcon name={'mdi-magnify'} />}
                  />
                  {/* <VToolbarMenu to={props.home}>{props.title}</VToolbarMenu> */}
                  {/* <VToolbarTitle>Vui</VToolbarTitle> */}
                  <VToolbarEdge edge="end" style={{ marginLeft: '0' }}>
                    <VMenu
                      // distance={0}
                      // openOnHover
                      v-slots={{
                        activator: ({ attrs }) => (
                          <VButton
                            rounded
                            icon={'mdi-translate'}
                            size="lg"
                            {...attrs}
                          />
                        ),
                        default: () => (
                          <div class="v-docs-layout__languages">
                            <h4 class="v-docs-layout__languages__title">
                              {pkg.i18n.at.common.t.translations}
                            </h4>
                            <VLanguageSwitcher class="v-docs-layout__languages__nav" />
                          </div>
                        ),
                      }}
                    />
                    <VButton
                      href={pkg.github}
                      target="_blank"
                      title={pkg.name}
                      rounded
                      icon={'mdi-github'}
                      size="lg"
                    />
                  </VToolbarEdge>
                </VToolbar>
              );
            },
            default: () => (
              <VAppContainer class="pb-8">
                {ctx.slots.default && ctx.slots.default()}
              </VAppContainer>
            ),
            drawer: () => {
              return (
                <VDrawerLayout
                  class="v-docs-layout__drawer"
                  color="secondary"
                  v-slots={{
                    header: () => (
                      <VPageLink class="v-docs-layout__drawer__header" to="/">
                        <VBusyImage
                          class="v-docs-layout__drawer__header__icon"
                          src="/logo.svg"
                          alt=""
                          width={24}
                          height={24}
                        />
                        fastkit
                      </VPageLink>
                    ),
                  }}>
                  {/* <VNavigation
                    caption="本体に戻る"
                    items={[
                      {
                        key: 'fastkit',
                        label: 'HOME',
                        startIcon: 'mdi-home',
                        to: '/',
                      },
                    ]}
                  /> */}

                  {props.navigations.map((navigation, navigationIndex) => (
                    <VNavigation
                      {...navigation}
                      key={`nav-${navigation.key || navigationIndex}`}
                    />
                  ))}

                  {/* <VNavigation
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
                  /> */}
                </VDrawerLayout>
              );
            },
          }}
        />
      );
    };
  },
});

import './VDocsLayout.scss';

import { defineComponent, PropType, computed } from 'vue';
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
import { VLanguageSwitcher } from '../VLanguageSwitcher';
import { PackageProvide } from '~/composables';
import { i18n } from '~/i18n';
import { FASTKIT_AUTHOR } from '~~~/core/constants';

export type DocsLayoutNavigation = NavigationInput & { key?: string | number };

interface PackageScope {
  displayName: string;
  github: string;
}

export const VDocsLayout = defineComponent({
  name: 'VDocsLayout',
  props: {
    navigations: {
      type: Array as PropType<DocsLayoutNavigation[]>,
      default: () => [],
    },
  },
  setup(props, ctx) {
    const mediaMatch = useMediaMatch();
    const drawerStatic = () => mediaMatch('lg');
    const pkg = PackageProvide.use(true);
    const { trans } = i18n.use().at.common;
    const packageScopeRef = computed<PackageScope>(() => {
      if (!pkg) {
        return {
          displayName: 'fastkit',
          github: `https://github.com/${FASTKIT_AUTHOR}/fastkit`,
        };
      }

      return {
        displayName: pkg.displayName,
        github: pkg.github,
      };
    });

    return () => {
      const packageScope = packageScopeRef.value;

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
                        src={`${import.meta.env.BASE_URL}logo.svg`}
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
                    placeholder={`Search ${packageScope.displayName}`}
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
                              {trans.translations}
                            </h4>
                            <VLanguageSwitcher class="v-docs-layout__languages__nav" />
                          </div>
                        ),
                      }}
                    />
                    <VButton
                      href={packageScope.github}
                      target="_blank"
                      title="GitHub"
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
                          src={`${import.meta.env.BASE_URL}logo.svg`}
                          alt=""
                          width={24}
                          height={24}
                        />
                        fastkit
                      </VPageLink>
                    ),
                  }}>
                  {props.navigations.map((navigation, navigationIndex) => (
                    <VNavigation
                      {...navigation}
                      key={`nav-${navigation.key || navigationIndex}`}
                    />
                  ))}
                </VDrawerLayout>
              );
            },
          }}
        />
      );
    };
  },
});

import './VDocsLayout.scss';

import { defineComponent, PropType, computed } from 'vue';
import {
  VueAppLayout,
  VAppToolbar,
  VAppDrawer,
  useMediaMatch,
  VAppContainer,
  VButton,
  VToolbar,
  VToolbarEdge,
  VNavigation,
  VDrawerLayout,
  VToolbarMenu,
  VBusyImage,
  VTextField,
  VIcon,
  NavigationInput,
  VMenu,
} from '@fastkit/vui';
import { VPageLink } from '@fastkit/vue-page';
import { VLanguageSwitcher } from '../VLanguageSwitcher';
import { PackageProvide, i18n } from '@@';
import fastkitPackageJSON from '../../../../../package.json';

const FASTKIT_AUTHOR = fastkitPackageJSON.author;

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
    const layout = VueAppLayout.use();
    const drawer = layout.createDrawerControl();
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
        <div class="v-docs-layout">
          <VAppToolbar>
            <VToolbar>
              {!drawer.isStatic && (
                <VToolbarEdge edge="start" class="mr-0">
                  <VButton
                    icon="mdi-menu"
                    size="lg"
                    rounded
                    onClick={() => {
                      drawer.toggle();
                    }}
                  />
                </VToolbarEdge>
              )}
              {!drawer.isStatic && (
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
          </VAppToolbar>
          <VAppContainer class="pb-8">{ctx.slots.default?.()}</VAppContainer>
          <VAppDrawer
            id={drawer}
            class="v-docs-layout__drawer"
            static={drawerStatic}>
            <VDrawerLayout
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
          </VAppDrawer>
        </div>
      );
    };
  },
});

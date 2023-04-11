import * as styles from './index.css';
import { defineComponent, VNode } from 'vue';
import {
  VAppSystemBar,
  VAppToolbar,
  VAppDrawer,
  VAppContainer,
  VueAppLayoutPositionX,
} from '@fastkit/vue-app-layout';
import { VHero, VButton, VDialog, VBreadcrumbs } from '@fastkit/vui';
import { ItemLevel } from './-schemes';
import { PlaygroundContext } from './-context';
import { PlaygroundEditor } from './-components';
import { range } from '@fastkit/helpers';

export default defineComponent({
  setup() {
    const ctx = new PlaygroundContext();

    const renderSystemBar = (level: ItemLevel): VNode | void => {
      const systemBarState = ctx.state.systemBar[level];
      if (!systemBarState) return;

      return (
        <VAppSystemBar
          position={systemBarState.position}
          active={systemBarState.active}
          v-slots={{
            default: () => (
              <div
                class={[
                  styles.systemBar,
                  'elevation-4',
                ]}>{`System bar(${level})`}</div>
            ),
          }}
        />
      );
    };

    const renderToolbarDrawerActivator = (position: VueAppLayoutPositionX) => {
      const drawerState = ctx.getDrawerStateByPosition(position);
      if (!drawerState || drawerState.static) return;

      return (
        <VButton
          class={styles.toolbarMenu}
          icon="mdi-menu"
          rounded
          size="lg"
          onClick={() => {
            ctx.layout.toggleDrawer(position);
          }}
        />
      );
    };

    const renderToolbar = (level: ItemLevel): VNode | void => {
      const toolbarState = ctx.state.toolbar[level];
      if (!toolbarState) return;

      return (
        <VAppToolbar
          position={toolbarState.position}
          active={toolbarState.active}
          v-slots={{
            default: () => {
              return (
                <div class={[styles.toolbar, 'elevation-4']}>
                  {renderToolbarDrawerActivator('left')}
                  <div>{`Toolbar(${level})`}</div>
                  <VButton
                    class={styles.toolbarEdit}
                    onClick={(ev) => {
                      ctx.edting = true;
                    }}>
                    Edit
                  </VButton>
                  {renderToolbarDrawerActivator('right')}
                </div>
              );
            },
          }}
        />
      );
    };

    const renderDrawer = (level: ItemLevel): VNode | void => {
      const drawerState = ctx.state.drawer[level];
      if (!drawerState) return;

      return (
        <VAppDrawer
          id={ctx.drawerId[level]}
          position={drawerState.position}
          backdrop={drawerState.backdrop}
          sticked={drawerState.sticked}
          static={drawerState.static}
          rale={drawerState.rale}
          v-slots={{
            default: () => {
              return (
                <div
                  class={[
                    styles.drawer,
                    'elevation-4',
                    { [styles.drawerRale]: drawerState.rale },
                  ]}>
                  {drawerState.rale ? (
                    <div key="default">
                      <VButton
                        class={styles.drawerRaleButton}
                        icon={
                          drawerState.position === 'left'
                            ? 'mdi-arrow-right'
                            : 'mdi-arrow-left'
                        }
                        size="lg"
                        onClick={() => {
                          drawerState.rale = false;
                        }}
                      />
                    </div>
                  ) : (
                    <div key="rale">
                      <div class={styles.drawerLabel}>{`Drawer(${level})`}</div>
                      <PlaygroundEditor tabs />
                      <div>
                        {range(50).map((i) => (
                          <p>This is text.</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      );
    };

    const renderLevel = (level: ItemLevel): VNode[] => {
      const nodes: VNode[] = [];
      const systemBar = renderSystemBar(level);
      const toolbar = renderToolbar(level);
      const drawer = renderDrawer(level);

      systemBar && nodes.push(systemBar);
      toolbar && nodes.push(toolbar);
      drawer && nodes.push(drawer);

      return nodes;
    };

    return () => {
      return (
        <div>
          {renderLevel('main')}
          <VAppContainer>
            <VHero>Playground</VHero>

            <VBreadcrumbs
              items={[
                {
                  to: '/vue-app-layout/',
                  text: 'Vue App Layout',
                },
                {
                  text: 'Playground',
                },
              ]}
            />

            <p>各種コンポーネントの組み合わせをテストすることができます。</p>

            <PlaygroundEditor />

            <div>
              {range(100).map((i) => (
                <p key={`row-${i}`}>
                  This is content... This is content... This is content... This
                  is content... This is content... This is content... This is
                  content... This is content... This is content... This is
                  content...
                </p>
              ))}
            </div>
          </VAppContainer>
          {renderLevel('sub')}

          <VDialog
            v-model={ctx.edting}
            v-slots={{
              default: () => (
                <div>
                  <PlaygroundEditor tabs />
                </div>
              ),
            }}
          />
        </div>
      );
    };
  },
});

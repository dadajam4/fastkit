import * as styles from './PlaygroundEditor.css';
import { defineComponent, ref, Fragment } from 'vue';
import { PlaygroundContext } from '../-context';
import {
  VAL_X_POSITIONS,
  VAL_Y_POSITIONS,
  VueAppLayoutPositionX,
  VueAppLayoutPositionY,
  VAL_STICK_Y_POSITIONS,
  FormSelectorItem,
  VForm,
  VSwitch,
  VRadioGroup,
  VTabs,
  VTabsItem,
  VContentSwitcher,
  VAppContainer,
  VFormControl,
} from '@fastkit/vui';
import { ItemLevel } from '../-schemes';

export const PlaygroundEditor = defineComponent({
  name: 'PlaygroundEditor',
  props: {
    tabs: Boolean,
  },
  setup(props) {
    const ctx = PlaygroundContext.use();
    const tabs: VTabsItem[] = [
      {
        label: 'System bar',
        value: 'systemBar',
      },
      {
        label: 'Toolbar',
        value: 'toolbar',
      },
      {
        label: 'Drawer',
        value: 'drawer',
      },
    ];

    const selectedTab = ref(tabs[0].value);

    const xOptions: FormSelectorItem[] = VAL_X_POSITIONS.map((x) => ({
      label: x,
      value: x,
    }));

    const yOptions: FormSelectorItem[] = VAL_Y_POSITIONS.map((x) => ({
      label: x,
      value: x,
    }));

    const stickedYOptions: FormSelectorItem[] = VAL_STICK_Y_POSITIONS.map(
      (x) => ({
        label: x,
        value: x,
      }),
    );

    const setBarPosition = (
      type: 'systemBar' | 'toolbar',
      level: ItemLevel,
      position: VueAppLayoutPositionY,
    ) => {
      const state = ctx.state[type][level];
      if (!state) return;
      state.position = position;
      const alternateState = ctx.state[type][level === 'main' ? 'sub' : 'main'];
      if (!alternateState) return;
      alternateState.position = position === 'top' ? 'bottom' : 'top';
    };

    const setDrawerPosition = (
      level: ItemLevel,
      position: VueAppLayoutPositionX,
    ) => {
      const state = ctx.state.drawer[level];
      if (!state) return;
      state.position = position;
      const alternateState =
        ctx.state.drawer[level === 'main' ? 'sub' : 'main'];
      if (!alternateState) return;
      alternateState.position = position === 'left' ? 'right' : 'left';
    };

    const slots = {
      systemBar: () => {
        return (
          <VAppContainer class={styles.item}>
            {ctx.mapSystemBarModels((model) => {
              const { state } = model;
              return (
                <div class={styles.level}>
                  <VSwitch class={styles.levelActivator} v-model={model.use}>
                    {model.level}
                  </VSwitch>
                  {state && (
                    <>
                      <VFormControl hiddenInfo label="State">
                        <VSwitch class={styles.field} v-model={state.active}>
                          active
                        </VSwitch>
                      </VFormControl>

                      <VRadioGroup
                        class={styles.field}
                        label="Position"
                        items={yOptions}
                        modelValue={state.position}
                        onUpdate:modelValue={(position) => {
                          setBarPosition(
                            'systemBar',
                            model.level,
                            position as any,
                          );
                        }}
                        stacked={false}
                        hiddenInfo
                      />
                    </>
                  )}
                </div>
              );
            })}
          </VAppContainer>
        );
      },
      toolbar: () => {
        return (
          <VAppContainer class={styles.item}>
            {ctx.mapToolbarModels((model) => {
              const { state } = model;
              return (
                <div class={styles.level}>
                  <VSwitch class={styles.levelActivator} v-model={model.use}>
                    {model.level}
                  </VSwitch>
                  {state && (
                    <>
                      <VFormControl hiddenInfo label="State">
                        <VSwitch class={styles.field} v-model={state.active}>
                          active
                        </VSwitch>
                      </VFormControl>

                      <VRadioGroup
                        class={styles.field}
                        label="Position"
                        items={yOptions}
                        modelValue={state.position}
                        onUpdate:modelValue={(position) => {
                          setBarPosition(
                            'toolbar',
                            model.level,
                            position as any,
                          );
                        }}
                        stacked={false}
                        hiddenInfo
                      />
                    </>
                  )}
                </div>
              );
            })}
          </VAppContainer>
        );
      },
      drawer: () => {
        return (
          <VAppContainer class={styles.item}>
            {ctx.mapDrawerModels((model) => {
              const { state } = model;
              const drawer = ctx.layout.getDrawerById(
                ctx.drawerId[model.level],
              );

              return (
                <div class={styles.level}>
                  <VSwitch class={styles.levelActivator} v-model={model.use}>
                    {model.level}
                  </VSwitch>
                  {state && drawer && (
                    <>
                      <VFormControl hiddenInfo label="State">
                        <VSwitch
                          class={styles.field}
                          modelValue={drawer.isActive}
                          disabled={drawer.isStatic}
                          onUpdate:modelValue={(isActive) => {
                            isActive ? drawer.open() : drawer.close();
                          }}>
                          active
                        </VSwitch>
                        <VSwitch class={styles.field} v-model={state.static}>
                          static
                        </VSwitch>
                        <VSwitch class={styles.field} v-model={state.backdrop}>
                          backdrop
                        </VSwitch>
                        <VSwitch class={styles.field} v-model={state.rale}>
                          rale
                        </VSwitch>
                      </VFormControl>

                      <VRadioGroup
                        class={styles.field}
                        label="Position"
                        items={xOptions}
                        modelValue={state.position}
                        onUpdate:modelValue={(position) => {
                          setDrawerPosition(model.level, position as any);
                        }}
                        stacked={false}
                        hiddenInfo
                      />

                      <VRadioGroup
                        class={styles.field}
                        label="Sticked Top"
                        items={stickedYOptions}
                        v-model={state.sticked.top}
                        stacked={false}
                        hiddenInfo
                      />

                      <VRadioGroup
                        class={styles.field}
                        label="Sticked Bottom"
                        items={stickedYOptions}
                        v-model={state.sticked.bottom}
                        stacked={false}
                        hiddenInfo
                      />
                    </>
                  )}
                </div>
              );
            })}
          </VAppContainer>
        );
      },
    };

    const renderDefault = () => {
      return (
        <Fragment key="default">
          {tabs.map(({ label, value }) => (
            <div>
              <h3 class={styles.defaultHeading}>
                <span class={styles.defaultHeadingLabel}>{label}</span>
              </h3>
              <VAppContainer key={value}>
                {(slots as any)[value]()}
              </VAppContainer>
            </div>
          ))}
        </Fragment>
      );
    };

    const renderTabs = () => {
      return (
        <Fragment key="tabs">
          <VTabs items={tabs} v-model={selectedTab.value} />
          <VContentSwitcher
            order={tabs}
            v-model={selectedTab.value}
            v-slots={slots}
          />
        </Fragment>
      );
    };

    const renderBody = () => (props.tabs ? renderTabs() : renderDefault());

    return () => {
      return (
        <VForm size="sm">
          <VAppContainer pulled>{renderBody()}</VAppContainer>
        </VForm>
      );
    };
  },
});

import './VSelect.scss';
import { ref, VNodeChild, defineComponent, PropType, computed } from 'vue';
import {
  createFormSelectorSettings,
  useFormSelectorControl,
  createFormControlProps,
  defineSlotsProps,
  FormControlSlots,
  FormSelectorItemControl,
  createPropsOptions,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
} from '@fastkit/vue-kit';
import { VFormControl } from '../VFormControl';
import {
  VControlField,
  createControlFieldProps,
  InputBoxSlots,
} from '../VControlField';
import {
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
} from '../../composables';
import { VUI_SELECT_SYMBOL, useVui } from '../../injections';
import { VIcon } from '../VIcon';
import { VMenu } from '../kits';
import { VOptionGroup } from '../VOptionGroup';
import { VOption } from '../VOption';
import { VButton } from '..';

const { props, emits } = createFormSelectorSettings();

export const VSelect = defineComponent({
  name: 'VSelect',
  props: {
    ...props,
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<FormControlSlots & InputBoxSlots>(),
    ...createPropsOptions({
      placeholder: String,
      loadingMessage: {} as PropType<VNodeChildOrSlot>,
      failedToLoadItemsMessage: {} as PropType<VNodeChildOrSlot>,
    }),
  },
  emits,
  setup(props, ctx) {
    const menuOpened = ref(false);
    const showMenu = () => {
      menuOpened.value = true;
    };
    const closeMenu = () => {
      menuOpened.value = false;
    };
    const inputControl = useFormSelectorControl(props, ctx, {
      nodeType: VUI_SELECT_SYMBOL,
      onSelectItem: (item) => {
        closeMenu();
      },
    });
    const control = useControl(props);
    useControlField(props);
    const vui = useVui();
    const iconName = vui.icon('menuDown');
    const fieldRef = ref<HTMLElement | null>(null);
    const loadingMessageRef = computed(() => {
      const slot = resolveVNodeChildOrSlots(
        props.loadingMessage,
        vui.setting('loadingMessage'),
        'Loading...',
      );
      return slot && slot(vui);
    });
    const failedToLoadItemsMessageRef = computed(() => {
      const slot = resolveVNodeChildOrSlots(
        props.failedToLoadItemsMessage,
        vui.setting('failedToLoadDataMessage'),
        'Failed to load data.',
      );
      return slot && slot(vui);
    });

    const focus = (opts?: FocusOptions): void => {
      fieldRef.value && fieldRef.value.focus(opts);
    };

    const renderSelections = (selectedItems: FormSelectorItemControl[]) => {
      const children: VNodeChild[] = [];
      if (inputControl.itemsLoadFailed) {
        children.push(
          <span class="v-select__placeholder">
            {failedToLoadItemsMessageRef.value}
          </span>,
        );
      } else if (inputControl.itemsLoading) {
        children.push(
          <span class="v-select__placeholder">{loadingMessageRef.value}</span>,
        );
      } else if (selectedItems.length) {
        selectedItems.forEach((item, index) => {
          if (index > 0) {
            children.push(vui.selectionSeparator());
          }
          children.push(item.renderDefaultSlot());
        });
      } else if (props.placeholder != null) {
        children.push(
          <span class="v-select__placeholder">{props.placeholder}</span>,
        );
      }
      return children;
    };

    return {
      ...inputControl.expose(),
      ...control,
      iconName,
      menuOpened,
      fieldRef: () => fieldRef,
      focus,
      showMenu,
      closeMenu,
      renderSelections,
    };
  },
  render() {
    const { nodeControl, selectorControl, selectorItems, selectedItems } = this;
    const children = (this.$slots.default && this.$slots.default()) || [];
    const propGroups = this.propGroups.map((group) => {
      return (
        <VOptionGroup
          key={group.id}
          groupId={group.id}
          label={group.label(selectorControl)}
          disabled={group.disabled}>
          {group.items.map((item) => (
            <VOption
              disabled={item.disabled}
              value={item.value}
              key={item.value}>
              {{
                default: () => item.label(selectorControl),
              }}
            </VOption>
          ))}
        </VOptionGroup>
      );
    });

    return (
      <VFormControl
        nodeControl={nodeControl}
        // focused={this.nodeControl.focused}
        class={[
          'v-select',
          this.classes,
          {
            'v-select--multiple': this.multiple,
          },
        ]}
        label={this.label}
        hint={this.hint}
        hinttip={this.hinttip}
        hiddenInfo={this.hiddenInfo}
        requiredChip={this.requiredChip}
        onClickLabel={(ev) => {
          this.focus();
        }}
        v-slots={{
          ...this.$slots,
          default: () => (
            <VMenu
              width="fit"
              maxWidth="fit"
              distance={0}
              alwaysRender
              v-model={this.menuOpened}
              itemElements={(body) => body.querySelectorAll('.v-option')}
              onChoiceItemElement={(item) => {
                const ev = new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                item.dispatchEvent(ev);
              }}
              v-slots={{
                activator: ({ attrs, control }) => [
                  <VControlField
                    class="v-select__input"
                    ref={this.fieldRef()}
                    loading={selectorControl.itemsLoading}
                    error={selectorControl.itemsLoadFailed}
                    startAdornment={this.startAdornment}
                    endAdornment={this.endAdornment}
                    // tabindex={this.computedTabindex}
                    size={this.size}
                    focused={this.menuOpened}
                    autoHeight={this.multiple}
                    onClick={(ev) => {
                      if (this.canOperation && !control.isActive) {
                        let t = ev.target as HTMLElement;
                        const count = 0;
                        let hit = false;
                        while (count < 5) {
                          if (t.classList.contains('v-select__input')) {
                            hit = true;
                            break;
                          }
                          t = t.parentElement as HTMLElement;
                        }
                        control.show(hit ? t : ev);
                      }
                    }}
                    v-slots={{
                      ...this.$slots,
                      default: () => [
                        <select
                          class="v-select__input__element"
                          name={this.name}
                          tabindex={this.computedTabindex}
                          disabled={this.isDisabled}
                          multiple={this.multiple}
                          onFocus={nodeControl.focusHandler}
                          onBlur={nodeControl.blurHandler}
                          v-model={this.currentValue}
                          // value={nodeControl.value}
                        >
                          {selectorItems.map((item) => {
                            return (
                              <option
                                value={item.propValue}
                                key={item.propValue}>
                                {item.renderDefaultSlot()}
                              </option>
                            );
                          })}
                        </select>,
                        <div class="v-select__selections">
                          <div class="v-select__selections__inner">
                            {this.renderSelections(selectedItems)}
                          </div>
                        </div>,
                      ],
                      endAdornment: () => {
                        if (selectorControl.itemsLoadFailed) {
                          return (
                            <VButton
                              key="reload"
                              icon={this.$vui.icon('reload')}
                              rounded
                              onClick={(ev) => {
                                ev.stopPropagation();
                                selectorControl.loadItems();
                              }}
                            />
                          );
                        }

                        if (this.clearable && this.nodeControl.value != null) {
                          return (
                            <VButton
                              key="clear"
                              icon={this.$vui.icon('clear')}
                              rounded
                              onClick={(ev) => {
                                ev.stopPropagation();
                                this.nodeControl.clear();
                              }}
                            />
                          );
                        }

                        return (
                          <VIcon
                            key="icon"
                            name={this.iconName}
                            rotate={this.menuOpened ? 180 : 0}
                          />
                        );
                      },
                    }}
                  />,
                ],
              }}>
              <div class={['v-select__body', this.classes]}>
                {children}
                {propGroups}
              </div>
            </VMenu>
          ),
        }}
      />
    );
  },
});

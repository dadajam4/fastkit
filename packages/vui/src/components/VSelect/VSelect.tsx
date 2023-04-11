import './VSelect.scss';
import {
  ref,
  Ref,
  VNodeChild,
  defineComponent,
  PropType,
  computed,
  nextTick,
} from 'vue';
import {
  createFormSelectorSettings,
  useFormSelectorControl,
  createFormControlProps,
  FormControlSlots,
  FormSelectorItemControl,
} from '@fastkit/vue-form-control';
import {
  defineSlotsProps,
  createPropsOptions,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
} from '@fastkit/vue-utils';
import { useKeyboard } from '@fastkit/vue-keyboard';
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
import { VButton } from '../VButton';
import { VMenuControl } from '@fastkit/vue-stack';

export const ARROW_KEY_TYPES = useKeyboard.Key(['ArrowUp', 'ArrowDown']);

export const CHOICE_KEY_TYPES = useKeyboard.Key(['Enter', ' ']);

export const KEYBORD_EVENT_TYPES = useKeyboard.Key([
  ...ARROW_KEY_TYPES,
  ...CHOICE_KEY_TYPES,
]);

const { props, emits } = createFormSelectorSettings();

export const VSelect = defineComponent({
  name: 'VSelect',
  props: {
    ...props,
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<
      FormControlSlots &
        InputBoxSlots & {
          selection: { item: FormSelectorItemControl; index: number };
        }
    >(),
    ...createPropsOptions({
      placeholder: String,
      loadingMessage: {} as PropType<VNodeChildOrSlot>,
      failedToLoadItemsMessage: {} as PropType<VNodeChildOrSlot>,
    }),
    closeOnNavigation: Boolean,
  },
  emits,
  setup(props, ctx) {
    const menuRef: Ref<{ stackMenuControl: VMenuControl } | null> = ref(null);
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
      const selectionSlot = ctx.slots.selection;
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
          const child = selectionSlot
            ? selectionSlot({ item, index })
            : item.renderDefaultSlot();
          children.push(child);
        });
      } else if (props.placeholder != null) {
        children.push(
          <span class="v-select__placeholder">{props.placeholder}</span>,
        );
      }

      return children;
    };

    const clearKeyFocused = () => {
      const menu = menuRef.value;
      if (!menu) return;
      const bodyEl = menu.stackMenuControl.bodyRef.value;
      if (!bodyEl) return;

      const els = Array.from(
        bodyEl.querySelectorAll('.v-option'),
      ) as HTMLElement[];

      els.forEach((el) => el.classList.remove('v-option--key-focused'));
    };

    const getItemElements = (): HTMLElement[] | void => {
      const menu = menuRef.value;
      if (!menu) return;

      const bodyEl = menu.stackMenuControl.bodyRef.value;

      if (!bodyEl) return;

      const els = (
        Array.from(bodyEl.querySelectorAll('.v-option')) as HTMLElement[]
      ).filter((el) => {
        if (el.tabIndex === -1) return false;
        const disabled = el.getAttribute('disabled');
        const ariaDisabled = el.getAttribute('aria-disabled');
        if (ariaDisabled === 'true') return false;
        return disabled == null || disabled === '';
      });

      if (!els.length) return;

      return els;
    };

    const arrowKeyHandler = (ev: KeyboardEvent) => {
      const { key } = ev;
      if (!menuOpened.value || !ARROW_KEY_TYPES.includes(key as any)) return;

      const els = getItemElements();

      if (!els) return;

      const currentEl = els.find((el) =>
        el.classList.contains('v-option--key-focused'),
      );
      const currentIndex = currentEl && els.indexOf(currentEl);
      let nextIndex: number;
      const { length } = els;
      const isUp = key === 'ArrowUp';
      if (currentIndex == null) {
        nextIndex = isUp ? length - 1 : 0;
      } else {
        const shiftAmount = key === 'ArrowUp' ? -1 : 1;
        nextIndex = currentIndex + shiftAmount;
        if (nextIndex < 0) {
          nextIndex = length - 1;
        } else if (nextIndex >= length) {
          nextIndex = 0;
        }
      }

      const nextEl = els[nextIndex];

      if (nextEl) {
        clearKeyFocused();
        nextEl.classList.add('v-option--key-focused');
        nextEl.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'smooth',
        });
        ev.preventDefault();
      }
    };

    const choiceKeyHandler = (ev: KeyboardEvent) => {
      const { key } = ev;
      if (!menuOpened.value || !CHOICE_KEY_TYPES.includes(key as any)) return;

      const els = getItemElements();

      if (!els) return;

      const currentEl = els.find((el) =>
        el.classList.contains('v-option--key-focused'),
      );

      if (currentEl) {
        const ev = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        currentEl.dispatchEvent(ev);
        ev.preventDefault();
        nextTick(() => {
          currentEl.classList.add('v-option--key-focused');
        });
      }
    };

    const keyboardEventHandler = (ev: KeyboardEvent) => {
      if (ARROW_KEY_TYPES.includes(ev.key as any)) return arrowKeyHandler(ev);
      if (CHOICE_KEY_TYPES.includes(ev.key as any)) return choiceKeyHandler(ev);
    };

    useKeyboard(
      [
        {
          key: KEYBORD_EVENT_TYPES,
          handler: keyboardEventHandler,
        },
      ],
      { autorun: true },
    );

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
      menuRef: () => menuRef,
      clearKeyFocused,
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
              closeOnNavigation={this.closeOnNavigation}
              distance={0}
              alwaysRender
              v-model={this.menuOpened}
              ref={this.menuRef()}
              onClose={this.clearKeyFocused}
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

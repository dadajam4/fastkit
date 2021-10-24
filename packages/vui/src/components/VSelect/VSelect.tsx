import './VSelect.scss';
import { ref, VNodeChild, defineComponent } from 'vue';
import {
  createFormSelectorSettings,
  useFormSelectorControl,
  createFormControlProps,
  defineSlotsProps,
  FormControlSlots,
  FormSelectorItemControl,
  createPropsOptions,
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
  useVui,
} from '../../composables';
import { VUI_SELECT_SYMBOL } from '../../injections';
import { VIcon } from '../VIcon';
import { VMenu } from '..';
import { VOption } from '../VOption';

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

    const focus = (opts?: FocusOptions): void => {
      fieldRef.value && fieldRef.value.focus(opts);
    };

    const renderSelections = (selectedItems: FormSelectorItemControl[]) => {
      const children: VNodeChild[] = [];
      if (selectedItems.length) {
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
    const { nodeControl, selectorItems, selectedItems } = this;
    const children = (this.$slots.default && this.$slots.default()) || [];
    const propOptions = this.propItems.map((item) => {
      return (
        <VOption disabled={item.disabled} value={item.value} key={item.value}>
          {{
            default: () => item.label(this.nodeControl),
          }}
        </VOption>
      );
    });

    return (
      <VFormControl
        nodeControl={nodeControl}
        // focused={this.nodeControl.focused}
        class={['v-select', this.classes]}
        label={this.label}
        hint={this.hint}
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
              v-slots={{
                activator: ({ attrs, control }) => [
                  <VControlField
                    class="v-select__input"
                    ref={this.fieldRef()}
                    startAdornment={this.startAdornment}
                    endAdornment={this.endAdornment}
                    // tabindex={this.computedTabindex}
                    focused={this.menuOpened}
                    onClickHost={(ev) => {
                      if (!control.isActive) {
                        control.show(ev);
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
                            {/* {selectedItems.map((item) => {
                              return (
                                <span class="v-select__selection">
                                  {item.renderDefaultSlot()}
                                </span>
                              );
                            })} */}
                          </div>
                        </div>,
                      ],
                      endAdornment: () => (
                        <VIcon
                          name={this.iconName}
                          rotate={this.menuOpened ? 180 : 0}></VIcon>
                      ),
                    }}
                  />,
                ],
              }}>
              <div class={['v-select__body', this.classes]}>
                {children}
                {propOptions}
              </div>
            </VMenu>
          ),
        }}
      />
    );
  },
});

import './form-selector.scss';
import { VNodeChild, defineComponent, PropType, computed } from 'vue';
import {
  createFormControlProps,
  createFormSelectorSettings,
  FormControlSlots,
  useFormSelectorControl,
  FormSelectorControl,
  ResolvedFormSelectorItem,
  FormNodeControl,
} from '@fastkit/vue-form-control';
import {
  defineSlotsProps,
  TypedSlot,
  renderSlotOrEmpty,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
} from '@fastkit/vue-utils';
import { createControlProps, useControl } from './control';
import { VFormControl } from '../components/VFormControl';
import { useVui } from '../injections';
import { VProgressCircular } from '../components/loading';
import { CONTROL_LOADING_SPINNER_SIZES } from '../schemes';

export interface DefineFormSelectorComponentOptions {
  name: string;
  defaultMultiple?: boolean;
  nodeType: string;
  className: string;
  itemRenderer: (ctx: {
    control: FormSelectorControl;
    selected: boolean;
    attrs: ResolvedFormSelectorItem & {
      modelValue: boolean;
      key: string | number;
    };
    slots: {
      default: TypedSlot<FormNodeControl>;
    };
  }) => VNodeChild;
}

export function defineFormSelectorComponent(
  opts: DefineFormSelectorComponentOptions,
) {
  const { itemRenderer, defaultMultiple, nodeType, className } = opts;
  const { props, emits } = createFormSelectorSettings({
    defaultMultiple,
  });

  return defineComponent({
    name: opts.name,
    props: {
      ...props,
      ...createFormControlProps(),
      ...createControlProps(),
      stacked: {
        type: Boolean,
        default: true,
      },
      // eslint-disable-next-line vue/require-prop-types
      loadingMessage: {} as PropType<VNodeChildOrSlot>,
      // eslint-disable-next-line vue/require-prop-types
      failedToLoadItemsMessage: {} as PropType<VNodeChildOrSlot>,
      ...defineSlotsProps<FormControlSlots>(),
    },
    emits,
    setup(props, ctx) {
      const selectorControl = useFormSelectorControl(props, ctx, {
        nodeType,
        defaultMultiple,
      });
      const control = useControl(props);
      const vui = useVui();
      const loadingMessageRef = computed<VNodeChild | undefined>(() => {
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
      return {
        ...selectorControl.expose(),
        ...control,
        loadingMessageRef,
        failedToLoadItemsMessageRef,
      };
    },
    render() {
      const { selectorControl } = this;
      return (
        <VFormControl
          nodeControl={this.nodeControl}
          focused={this.nodeControl.focused}
          hiddenInfo={this.hiddenInfo}
          class={[
            'v-form-selector',
            className,
            {
              ...this.classes,
              'v-form-selector--stacked': this.stacked,
            },
          ]}
          label={this.label}
          hint={this.hint}
          hinttip={this.hinttip}
          requiredChip={this.requiredChip}
          error={selectorControl.itemsLoadFailed}
          v-slots={{
            ...this.$slots,
            default: () => (
              <div class="v-form-selector__body">
                {selectorControl.itemsLoadFailed && (
                  <div
                    key="failed"
                    class="v-form-selector__placeholder v-form-selector__placeholder--error">
                    {this.failedToLoadItemsMessageRef}
                  </div>
                )}
                {selectorControl.itemsLoading && (
                  <div key="loading" class="v-form-selector__placeholder">
                    <VProgressCircular
                      indeterminate
                      class="mr-1"
                      size={CONTROL_LOADING_SPINNER_SIZES[this.size || 'md']}
                    />

                    {this.loadingMessageRef}
                  </div>
                )}
                {this.propGroups.map((group) => {
                  const { items } = group;
                  return (
                    <>
                      {items.map((attrs) => {
                        const selected = selectorControl.isSelected(
                          attrs.value,
                        );
                        return itemRenderer({
                          selected,
                          control: selectorControl,
                          attrs: {
                            ...attrs,
                            modelValue: selected,
                            key: attrs.value,
                          },
                          slots: {
                            default: () => attrs.label(this.selectorControl),
                          },
                        });
                      })}
                    </>
                  );
                })}
                {renderSlotOrEmpty(this.$slots, 'default')}
              </div>
            ),
          }}
        />
      );
    },
  });
}

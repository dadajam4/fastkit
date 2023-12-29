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
  defineSlots,
  TypedSlot,
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

const slots = defineSlots<
  FormControlSlots & {
    default?: () => any;
  }
>();

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
      ...slots(),
    },
    slots,
    emits,
    setup(props, ctx) {
      const selectorControl = useFormSelectorControl(props, ctx, {
        nodeType,
        defaultMultiple,
      });
      const control = useControl(props);
      const classes = computed(() => [
        'v-form-selector',
        className,
        {
          ...control.classes.value,
          'v-form-selector--stacked': props.stacked,
        },
      ]);
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

      const defaultSlot = () => {
        return (
          <div class="v-form-selector__body">
            {selectorControl.itemsLoadFailed && (
              <div
                key="failed"
                class="v-form-selector__placeholder v-form-selector__placeholder--error">
                {failedToLoadItemsMessageRef.value}
              </div>
            )}
            {selectorControl.itemsLoading && (
              <div key="loading" class="v-form-selector__placeholder">
                <VProgressCircular
                  indeterminate
                  class="mr-1"
                  size={
                    CONTROL_LOADING_SPINNER_SIZES[control.size.value || 'md']
                  }
                />

                {loadingMessageRef.value}
              </div>
            )}
            {selectorControl.propGroups.map((group) => {
              const { items } = group;
              return (
                <>
                  {items.map((attrs) => {
                    const selected = selectorControl.isSelected(attrs.value);
                    return itemRenderer({
                      selected,
                      control: selectorControl,
                      attrs: {
                        ...attrs,
                        modelValue: selected,
                        key: attrs.value,
                      },
                      slots: {
                        default: () => attrs.label(selectorControl),
                      },
                    });
                  })}
                </>
              );
            })}
            {ctx.slots.default?.()}
          </div>
        );
      };

      ctx.expose({
        control: selectorControl,
      });

      return () => {
        return (
          <VFormControl
            nodeControl={selectorControl}
            focused={selectorControl.focused}
            hiddenInfo={props.hiddenInfo}
            class={classes.value}
            label={props.label}
            hint={props.hint}
            hinttip={props.hinttip}
            requiredChip={props.requiredChip}
            error={selectorControl.itemsLoadFailed}
            v-slots={{
              ...ctx.slots,
              default: defaultSlot,
            }}
          />
        );
      };
    },
  });
}

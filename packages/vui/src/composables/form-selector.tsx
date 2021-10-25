import './form-selector.scss';
import { VNodeChild, renderSlot, defineComponent } from 'vue';
import {
  defineSlotsProps,
  TypedSlot,
  createFormControlProps,
  createFormSelectorSettings,
  FormControlSlots,
  useFormSelectorControl,
  ResolvedFormSelectorItemData,
  FormNodeControl,
} from '@fastkit/vue-kit';
import { createControlProps, useControl } from './control';
import { VFormControl } from '../components/VFormControl';

export interface DefineFormSelectorComponentOptions {
  name: string;
  defaultMultiple?: boolean;
  nodeType: string;
  className: string;
  itemRenderer: (ctx: {
    attrs: ResolvedFormSelectorItemData & { key: string | number };
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
      ...defineSlotsProps<FormControlSlots>(),
    },
    emits,
    setup(props, ctx) {
      const selectorControl = useFormSelectorControl(props, ctx, {
        nodeType,
        defaultMultiple,
      });
      const control = useControl(props);
      return {
        ...selectorControl.expose(),
        ...control,
      };
    },
    render() {
      return (
        <VFormControl
          nodeControl={this.nodeControl}
          focused={this.nodeControl.focused}
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
          v-slots={{
            ...this.$slots,
            default: () => (
              <div class="v-form-selector__body">
                {this.propItems.map((attrs) =>
                  itemRenderer({
                    attrs: {
                      ...attrs,
                      key: attrs.value,
                    },
                    slots: {
                      default: () => attrs.label(this.nodeControl),
                    },
                  }),
                )}
                {renderSlot(this.$slots, 'default')}
              </div>
            ),
          }}
        />
      );
    },
  });
}

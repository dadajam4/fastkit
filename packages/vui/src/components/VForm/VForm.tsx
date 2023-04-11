import { defineComponent, computed } from 'vue';
import {
  VueForm,
  createFormSettings,
  useForm,
} from '@fastkit/vue-form-control';
import { defineSlotsProps, renderSlotOrEmpty } from '@fastkit/vue-utils';
import { getDocumentScroller } from '@fastkit/vue-scroller';
import { createControlProps, useControl } from '../../composables';
import { VUI_FORM_SYMBOL, useVui } from '../../injections';

const { props, emits } = createFormSettings({
  nodeType: VUI_FORM_SYMBOL,
});

export interface VFormSlots {
  default: VueForm;
}

export function createVFormProps() {
  return {
    ...props,
    ...createControlProps(),
    ...defineSlotsProps<VFormSlots>(),
    // disableAutoScroll: Boolean,
  };
}

export const VForm = defineComponent({
  name: 'VForm',
  props: createVFormProps(),
  emits,
  setup(props, ctx) {
    const vui = useVui();
    const nodeControl = useForm(props, ctx as any, {
      nodeType: VUI_FORM_SYMBOL,
      scrollToElement: (el) => {
        const scroller = getDocumentScroller();
        return scroller.toElement(el, {
          offset: vui.getAutoScrollToElementOffsetTop(),
        });
      },
    });
    const classes = computed(() => {
      return [
        'v-form',
        {
          'v-form--valid': nodeControl.valid,
          'v-form--invalid': nodeControl.invalid,
          'v-form--disabled': nodeControl.isDisabled,
          'v-form--validating': nodeControl.validating,
          'v-form--pending': nodeControl.pending,
          'v-form--submiting': nodeControl.submiting,
        },
      ];
    });
    useControl(props);

    return {
      ...nodeControl.expose(),
      classes,
    };
  },
  render() {
    const { form } = this;
    return (
      <form
        ref={this.formRef()}
        class={this.classes}
        action={this.nativeAction}
        spellcheck={this.spellcheck}
        onSubmit={form.handleSubmit}>
        {renderSlotOrEmpty(this.$slots, 'default', form as any)}
      </form>
    );
  },
});

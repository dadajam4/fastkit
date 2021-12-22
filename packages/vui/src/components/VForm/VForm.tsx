import { defineComponent, computed } from 'vue';
import {
  VueForm,
  createFormSettings,
  useForm,
  defineSlotsProps,
  renderSlotOrEmpty,
  getDocumentScroller,
} from '@fastkit/vue-kit';
import { createControlProps, useControl } from '../../composables';
import { VUI_FORM_SYMBOL, useVui } from '../../injections';

const { props, emits } = createFormSettings({
  nodeType: VUI_FORM_SYMBOL,
});

export interface VFormSlots {
  default: VueForm;
}

export const VForm = defineComponent({
  name: 'VForm',
  props: {
    ...props,
    ...createControlProps(),
    ...defineSlotsProps<VFormSlots>(),
    disableAutoScroll: Boolean,
  },
  emits,
  setup(props, ctx) {
    const vui = useVui();
    const nodeControl = useForm(props, ctx as any, {
      nodeType: VUI_FORM_SYMBOL,
      onAutoValidateError: () => {
        if (props.disableAutoScroll) return;
        const scroller = getDocumentScroller();
        const { firstInvalidEl } = nodeControl;
        firstInvalidEl &&
          scroller.toElement(firstInvalidEl, {
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

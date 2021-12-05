import './VButton.scss';
import { defineComponent, ExtractPropTypes, computed } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import {
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  ExtractPropInput,
} from '@fastkit/vue-utils';
import { useVui } from '../../injections';

export const vueButtonProps = {
  ...colorSchemeProps(),
  ...navigationableProps,
  // spacer: Boolean,
  loading: Boolean,
};

export type VButtonProps = ExtractPropInput<typeof vueButtonProps>;

export type VButtonResolvedProps = ExtractPropTypes<typeof vueButtonProps>;

export const VButton = defineComponent({
  name: 'VButton',
  props: vueButtonProps,
  emits: {
    ...navigationableEmits.emits,
  },
  setup(props) {
    const vui = useVui();
    const defaults = vui.setting('buttonDefault');
    const color = useColorClasses({
      color: () => props.color || defaults.color,
      variant: () => props.variant || defaults.variant,
    });
    const navigationable = useNavigationable(props);
    const isLoading = computed(() => props.loading);
    const isDisabled = computed(() => isLoading.value || props.disabled);
    return {
      ...color,
      navigationable,
      isDisabled,
    };
  },
  render() {
    const { navigationable, colorClasses, $slots, isDisabled } = this;
    const { Tag, attrs, classes } = navigationable;
    const children = $slots.default && $slots.default();
    const _attrs = {
      ...attrs,
    };
    if (isDisabled) {
      _attrs.disabled = true;
    }
    return (
      <Tag
        class={[
          'v-button',
          colorClasses,
          classes,
          // this.spacer ? 'v-button--spacer' : undefined,
        ]}
        {..._attrs}
        onClick={(ev: MouseEvent) => {
          if (this.isDisabled) {
            ev.preventDefault();
            return;
          }
          this.$emit('click', ev);
        }}>
        {children}
      </Tag>
    );
  },
});

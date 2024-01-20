import './VDialog.scss';

import {
  defineDialogComponent,
  createStackActionProps,
  useStackAction,
} from '@fastkit/vue-stack';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import { useVui } from '../../injections';

const colorProps = colorSchemeProps();

export const VDialog = defineDialogComponent({
  name: 'VDialog',
  props: {
    ...createStackActionProps(),
    ...colorProps,
    dense: Boolean,
  },
  setup(ctx) {
    const { props, control } = ctx;
    const vui = useVui();
    const actionControl = useStackAction(props, control, {
      resolver: (actions) => {
        if (actions.length === 0) {
          return [vui.stackAction('close')];
        }
        return actions;
      },
    });
    const color = useColorClasses(props, { useRootThemeDefault: true });

    return (children) => {
      const { $actions } = actionControl;
      return (
        <div
          class={[
            'v-dialog',
            color.colorClasses.value,
            props.dense && 'v-dialog--dense',
          ]}>
          <div class="v-dialog__body">{children}</div>
          {$actions.length > 0 && (
            <div class="v-dialog__actions">{$actions}</div>
          )}
        </div>
      );
    };
  },
});

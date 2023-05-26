import './VSnackbar.scss';

import {
  defineSnackbarComponent,
  createStackActionProps,
  useStackAction,
} from '@fastkit/vue-stack';
import { colorSchemeProps } from '@fastkit/vue-color-scheme';
import { useVui } from '../../injections';
import { useColorClasses } from '@fastkit/vue-color-scheme';

const colorProps = colorSchemeProps();

export const VSnackbar = defineSnackbarComponent({
  name: 'VSnackbar',
  props: {
    ...createStackActionProps(),
    ...colorProps,
  },
  setup(ctx) {
    const { props, control } = ctx;
    const vui = useVui();
    const actionControl = useStackAction(props, control, {
      resolver: (actions) => {
        if (actions.length === 0) {
          return [vui.stackAction('close')];
        } else {
          return actions;
        }
      },
    });
    const color = useColorClasses(props, { useRootThemeDefault: true });

    return (children) => {
      const { $actions } = actionControl;
      return (
        <div class={['v-snackbar', color.colorClasses.value]} {...ctx.attrs}>
          <div class="v-snackbar__inner">
            <div class="v-snackbar__body">{children}</div>
            {$actions.length > 0 && (
              <div class="v-snackbar__actions">{$actions}</div>
            )}
          </div>
        </div>
      );
    };
  },
});

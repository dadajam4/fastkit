import './VDialog.scss';
import {
  defineComponent,
  ComponentPropsOptions,
  EmitsOptions,
  SlotsType,
} from 'vue';
import { createStackableDefine } from '../schemes';
import {
  DefineStackableSettings,
  setupStackableComponent,
} from '../composables';
import { VueStackError } from '../logger';

interface CreateDialogSchemeOptions {
  /**
   * @default "v-stack-slide-y"
   */
  defaultTransition?: string;
}

function createDialogScheme(options: CreateDialogSchemeOptions = {}) {
  const { defaultTransition = 'v-stack-slide-y' } = options;

  const { props, emits } = createStackableDefine({
    defaultTransition,
    defaultFocusTrap: true,
    defaultFocusRestorable: true,
    defaultScrollLock: true,
  });

  return {
    props,
    emits,
  };
}

export interface DefineDialogSettings<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions,
  Slots extends SlotsType,
> extends DefineStackableSettings<Props, Emits, Slots>,
    CreateDialogSchemeOptions {
  props?: Props;
  emits?: Emits;
  slots?: Slots;
  attrs?: Record<string, any>;
}

export function defineDialogComponent<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions,
  Slots extends SlotsType,
>(settings: DefineDialogSettings<Props, Emits, Slots>) {
  const baseScheme = createDialogScheme(settings);
  const { name, props, emits } = settings;

  const Component = defineComponent({
    name,
    inheritAttrs: false,
    props: {
      ...baseScheme.props,
      ...props,
    } as typeof baseScheme.props & Props,
    emits: {
      ...baseScheme.emits,
      ...emits,
    } as typeof baseScheme.emits & Emits,
    slots: settings.slots,
    setup(_props, _ctx) {
      const dialogCtx = setupStackableComponent<typeof baseScheme.props>(
        _props,
        _ctx,
      );
      const { control } = dialogCtx;
      const render = settings.setup?.(dialogCtx as any) || settings.render;
      if (!render) {
        throw new VueStackError('render function is required.');
      }

      const hostBaseAttrs = settings.attrs || {};

      const hostAttrs = {
        ...hostBaseAttrs,
        class: ['v-stack-dialog', hostBaseAttrs.class],
        tabindex: '0',
      };

      return () => {
        return control.render((children, { withClickOutside }) => {
          return (
            <div {...hostAttrs}>
              <div class="v-stack-dialog__scroller">
                <div class="v-stack-dialog__centerer">
                  {withClickOutside(render(children, dialogCtx as any))}
                </div>
              </div>
            </div>
          );
        });
      };
    },
  });

  return Component;
}

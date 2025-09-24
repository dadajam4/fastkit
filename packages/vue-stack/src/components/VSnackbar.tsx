import './VSnackbar.scss';
import {
  defineComponent,
  computed,
  ComponentPropsOptions,
  EmitsOptions,
  SlotsType,
} from 'vue';
import { createStackableDefine, MergeStackBaseSlots } from '../schemes';
import {
  DefineStackableSettings,
  setupStackableComponent,
  EmitsToPropOptions,
} from '../composables';
import {
  VSnackbarTransition,
  stackSnackbarTransitionProps,
  SnackbarTransitionPropsOptions,
} from './VSnackbarTransition';
import { VueStackError } from '../logger';

type SnackbarPropsOptions = SnackbarTransitionPropsOptions;

/**
 * Snackbar position
 */
interface SnackPosition {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

interface SnackbarAPI {
  /**
   * Snackbar position
   *
   * @see {@link SnackPosition}
   */
  readonly position: SnackPosition;
  readonly attrs: Record<string, any>;
}

export interface DefineSnackbarSettings<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions,
  Slots extends SlotsType,
> extends DefineStackableSettings<
    Props & SnackbarPropsOptions,
    Emits,
    Slots,
    SnackbarAPI
  > {
  props?: Props;
  emits?: Emits;
  slots?: Slots;
  /**
   * @default "v-stack-fade"
   */
  defaultTransition?: string;
  /**
   * @default 6000
   */
  defaultTimeout?: number;
}

export function defineSnackbarComponent<
  Props extends Readonly<ComponentPropsOptions> = {},
  Emits extends EmitsOptions = {},
  Slots extends SlotsType = SlotsType<{}>,
>(settings: DefineSnackbarSettings<Props, Emits, Slots>) {
  const {
    name,
    defaultTransition = 'v-stack-fade',
    defaultTimeout = 6000,
  } = settings;
  const { props, emits } = createStackableDefine({
    defaultTransition,
    defaultCloseOnOutsideClick: false,
    defaultCloseOnNavigation: false,
    defaultTimeout,
  });

  const stackSnackbarProps = {
    ...props,
    ...stackSnackbarTransitionProps,
  };

  const Component = defineComponent({
    name,
    inheritAttrs: false,
    props: {
      ...stackSnackbarProps,
      ...settings.props,
    } as typeof stackSnackbarProps &
      Props &
      EmitsToPropOptions<typeof emits & Emits>,
    emits: {
      ...emits,
      ...settings.emits,
    } as typeof emits & Emits,
    slots: settings.slots as MergeStackBaseSlots<Slots>,
    setup(_props: any, _ctx) {
      const baseCtx = setupStackableComponent<
        SnackbarPropsOptions,
        {},
        Slots,
        SnackbarAPI
      >(_props, _ctx);

      const { control, props } = baseCtx;

      const { snackbarDefaultPosition } = control.$service;

      const snackPosition = computed<SnackPosition>(() => {
        let { top, bottom, left } = props;
        const { right } = props;

        if (top === bottom) {
          top = snackbarDefaultPosition === 'top';
          bottom = !top;
        }

        if (left && right) {
          left = false;
        }

        return {
          top,
          bottom,
          left,
          right,
        };
      });

      const snackClasses = computed(() => {
        const { left, right, top, bottom } = snackPosition.value;
        const hasHorizontal = left || right;
        return [
          'v-stack-snackbar',
          {
            'v-stack-snackbar--top': top,
            'v-stack-snackbar--bottom': bottom,
            'v-stack-snackbar--left': left,
            'v-stack-snackbar--right': right,
            'v-stack-snackbar--x-center': !hasHorizontal,
            'v-stack-snackbar--has-horizontal': hasHorizontal,
          },
        ];
      });

      const snackbarContext: typeof baseCtx = {
        ...baseCtx,
        get position() {
          return snackPosition.value;
        },
        get attrs() {
          return {
            class: snackClasses.value,
          };
        },
      };

      const render =
        settings.setup?.(snackbarContext as any) || settings.render;
      if (!render) {
        throw new VueStackError('render function is required.');
      }

      return () =>
        control.render((children) => render(children, snackbarContext as any), {
          transition: (child) => (
            <VSnackbarTransition {...snackPosition.value}>
              {child}
            </VSnackbarTransition>
          ),
        });
    },
  });

  return Component;
}

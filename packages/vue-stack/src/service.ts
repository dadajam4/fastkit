import { Ref, ref, markRaw } from 'vue';
import { VStackControl } from './schemes/control';
import {
  VStackDynamicSetting,
  VStackDynamicInternalSetting,
  VStackDynamicDialogInput,
  VStackDynamicSnackbarInput,
  resolveVStackDynamicInput,
  ResolvedVStackDynamicInput,
  VStackDynamicChildren,
} from './schemes/dynamic';
import {
  VStackAction,
  VStackBuiltinActionType,
  VStackBuiltinActions,
  BUILTIN_ACTION_HANDLERS,
} from './schemes/action';
export { VueStackInjectionKey } from './injections';
// import { ScopeName, ColorVariant } from '@fastkit/color-scheme';
import { VDialogProps } from './components/VDialog';

export interface VueStackServiceOptions {
  zIndex?: number;
  actions: VStackBuiltinActions;
}

export class VueStackService {
  readonly controls: VStackControl[] = [];
  readonly zIndex: number;
  readonly builtinActions: VStackBuiltinActions;
  private _increment = 0;
  private readonly _dynamicSettings: Ref<VStackDynamicInternalSetting[]> = ref(
    [],
  );

  get dynamicSettings() {
    return this._dynamicSettings.value;
  }

  constructor(opts: VueStackServiceOptions) {
    const { zIndex = 32767, actions } = opts;
    this.zIndex = zIndex;
    this.builtinActions = actions;
  }

  genId() {
    return ++this._increment;
  }

  add(control: VStackControl): number {
    let index = -1;
    if (!this.controls.includes(control)) {
      index = this.controls.push(control);
    }
    return index;
  }

  remove(control: VStackControl): VStackControl[] {
    const index = this.controls.indexOf(control);
    return this.controls.splice(index, 1);
  }

  someTransitioning() {
    return this.controls.some((control) => control.transitioning);
  }

  getFront() {
    const controls = this.controls.filter((control) => control.isActive);
    if (controls.length === 0) return;
    let maxControl: VStackControl | undefined;
    let maxActivateOrder = 0;
    controls.forEach((control) => {
      const { activateOrder } = control;
      if (activateOrder > maxActivateOrder) {
        maxActivateOrder = activateOrder;
        maxControl = control;
      }
    });
    return maxControl;
  }

  isFront(control: VStackControl) {
    return this.getFront() === control;
  }

  private removeDynamicSetting(setting: VStackDynamicInternalSetting) {
    const settings = this._dynamicSettings.value;
    const index = settings.indexOf(setting);
    if (index !== -1) {
      settings.splice(index, 1);
    }
  }

  dynamic(setting: VStackDynamicSetting) {
    return new Promise<any>((resolve, reject) => {
      const _setting: VStackDynamicInternalSetting = {
        id: this.genId(),
        setting: {
          ...setting,
          props: {
            ...setting.props,
            lazyBoot: true,
            modelValue: true,
          },
        },
        resolve,
        reject,
        remove: () => {
          this.removeDynamicSetting(_setting);
        },
      };
      this._dynamicSettings.value.push(_setting);
    });
  }

  async dialog(
    resolvedInput: ResolvedVStackDynamicInput<
      VDialogProps & {
        content: VStackDynamicChildren;
      }
    >,
  ) {
    const { VDialog } = await import('./components/VDialog');
    const { props, children } = resolvedInput;
    // if (!props.actions) {
    //   props.actions = [this.action('close')];
    // }
    return this.dynamic({
      Ctor: markRaw(VDialog),
      props: markRaw(props),
      children,
    });
  }
  // async dialog(input: VStackDynamicDialogInput) {
  //   const { VDialog } = await import('./components/VDialog');
  //   const { props, children } = resolveVStackDynamicInput(input);
  //   if (!props.actions) {
  //     props.actions = [this.action('close')];
  //   }
  //   return this.dynamic({
  //     Ctor: markRaw(VDialog),
  //     props: markRaw(props),
  //     children,
  //   });
  // }

  async alert(input: VStackDynamicDialogInput) {
    const resolvedInput = resolveVStackDynamicInput(input);
    if (!resolvedInput.props.actions) {
      resolvedInput.props.actions = [this.action('ok')];
    }
    return this.dialog(resolvedInput);
  }

  async confirm(input: VStackDynamicDialogInput) {
    const resolvedInput = resolveVStackDynamicInput(input);
    if (!resolvedInput.props.actions) {
      resolvedInput.props.actions = [this.action('cancel'), this.action('ok')];
    }
    return this.dialog(resolvedInput);
  }

  async snackbar(input: VStackDynamicSnackbarInput) {
    const { VSnackbar } = await import('./components/VSnackbar');
    const { props, children } = resolveVStackDynamicInput(input);
    return this.dynamic({
      Ctor: markRaw(VSnackbar),
      props: markRaw(props),
      children,
    });
  }

  action(key: VStackBuiltinActionType, override?: Partial<VStackAction>) {
    const factory = this.builtinActions[key];
    const _onClick = BUILTIN_ACTION_HANDLERS[key];
    const action: VStackAction = {
      key,
      content: ({ control, key }) => {
        const onClick = (ev: MouseEvent) => _onClick(control, ev);
        return factory({ service: this, control, key, bindings: { onClick } });
      },
      ...override,
    };
    return action;
  }
}

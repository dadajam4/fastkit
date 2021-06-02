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
  VStackActionMessageResolvers,
  VStackAction,
  DEFAULT_ACTION_MESSAGES,
  DEFAULT_ACTIONS,
} from './schemes/action';
export { VueStackInjectionKey } from './injections';
import { ScopeName } from '@fastkit/color-scheme';
import { VStackDialogProps } from './components/VStackDialog';

export interface VueStackServiceOptions {
  zIndex?: number;
  actionMessages?: Partial<VStackActionMessageResolvers>;
  primaryColor: ScopeName;
}

export class VueStackService {
  readonly controls: VStackControl[] = [];
  readonly zIndex: number;
  readonly primaryColor: ScopeName;
  private _increment = 0;
  private readonly _dynamicSettings: Ref<VStackDynamicInternalSetting[]> = ref(
    [],
  );
  readonly actionMessages: VStackActionMessageResolvers;

  get dynamicSettings() {
    return this._dynamicSettings.value;
  }

  constructor(opts: VueStackServiceOptions) {
    const { zIndex = 32767, actionMessages, primaryColor } = opts;
    this.zIndex = zIndex;
    this.primaryColor = primaryColor;
    this.actionMessages = {
      ...DEFAULT_ACTION_MESSAGES,
      ...actionMessages,
    };
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

  // ResolvedVStackDynamicInput

  async dialog(
    resolvedInput: ResolvedVStackDynamicInput<
      VStackDialogProps & {
        content: VStackDynamicChildren;
      }
    >,
  ) {
    const { VStackDialog } = await import('./components/VStackDialog');
    const { props, children } = resolvedInput;
    // if (!props.actions) {
    //   props.actions = [this.action('close')];
    // }
    return this.dynamic({
      Ctor: markRaw(VStackDialog),
      props: markRaw(props),
      children,
    });
  }
  // async dialog(input: VStackDynamicDialogInput) {
  //   const { VStackDialog } = await import('./components/VStackDialog');
  //   const { props, children } = resolveVStackDynamicInput(input);
  //   if (!props.actions) {
  //     props.actions = [this.action('close')];
  //   }
  //   return this.dynamic({
  //     Ctor: markRaw(VStackDialog),
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
    const { VStackSnackbar } = await import('./components/VStackSnackbar');
    const { props, children } = resolveVStackDynamicInput(input);
    return this.dynamic({
      Ctor: markRaw(VStackSnackbar),
      props: markRaw(props),
      children,
    });
  }

  actionMessage(key: keyof VStackActionMessageResolvers) {
    let child = this.actionMessages[key];
    if (typeof child === 'function') {
      child = child();
    }
    return child;
  }

  action(
    key: keyof VStackActionMessageResolvers,
    override?: Partial<VStackAction>,
  ) {
    const action = {
      ...DEFAULT_ACTIONS[key](this),
      ...override,
    };
    return action;
  }
}

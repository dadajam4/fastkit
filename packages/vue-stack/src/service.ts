import { Ref, ref, markRaw, ComputedRef, computed } from 'vue';
import { VStackControl } from './schemes/control';
export type { VStackControl } from './schemes/control';
import {
  VStackDynamicSetting,
  VStackDynamicInternalSetting,
  VStackDynamicDialogInput,
  VStackDynamicSnackbarInput,
  VStackDynamicMenuInput,
  resolveVStackDynamicInput,
  ResolvedVStackDynamicInput,
  VStackDynamicChildren,
  VStackDynamicSheetInput,
} from './schemes/dynamic';
export {
  type VStackDynamicDialogInput,
  type VStackDynamicInput,
  resolveVStackDynamicInput,
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
// import { VSheetModalProps } from './components/VSheetModal';

export interface VueStackServiceOptions {
  zIndex?: number;
  actions: VStackBuiltinActions;
  snackbarDefaultPosition?: 'top' | 'bottom';
}

export class VueStackService {
  private readonly _controls: Ref<(() => VStackControl)[]> = ref([]);
  private readonly __controls: ComputedRef<VStackControl[]>;
  // readonly controls: VStackControl[] = [];
  readonly zIndex: number;
  readonly snackbarDefaultPosition: 'top' | 'bottom';
  readonly builtinActions: VStackBuiltinActions;
  private _increment = 0;
  private readonly _dynamicSettings: Ref<VStackDynamicInternalSetting[]> = ref(
    [],
  );

  get controls() {
    return this.__controls.value;
  }

  get dynamicSettings() {
    return this._dynamicSettings.value;
  }

  constructor(opts: VueStackServiceOptions) {
    const { zIndex = 32767, actions, snackbarDefaultPosition = 'top' } = opts;
    this.zIndex = zIndex;
    this.builtinActions = actions;
    this.snackbarDefaultPosition = snackbarDefaultPosition;

    this.__controls = computed(() => this._controls.value.map((c) => c()));
  }

  genId() {
    return ++this._increment;
  }

  add(control: VStackControl): number {
    let index = -1;
    if (!this.__controls.value.includes(control)) {
      index = this._controls.value.push(() => control);
    }
    return index;
  }

  remove(control: VStackControl): VStackControl[] {
    const index = this.__controls.value.indexOf(control);
    return this._controls.value.splice(index, 1).map((c) => c());
  }

  someTransitioning() {
    return this.controls.some((control) => control.transitioning);
  }

  getActiveStacks() {
    return this.controls.filter((control) => control.isActive);
  }

  getFront(filter?: (control: VStackControl) => boolean) {
    const controls = this.controls.filter((control) => control.isActive);
    if (controls.length === 0) return;
    let maxControl: VStackControl | undefined;
    let maxActivateOrder = 0;
    controls.forEach((control) => {
      if (filter && !filter(control)) return;
      const { activateOrder } = control;
      if (activateOrder > maxActivateOrder) {
        maxActivateOrder = activateOrder;
        maxControl = control;
      }
    });
    return maxControl;
  }

  isFront(
    control: VStackControl,
    filter?: (control: VStackControl) => boolean,
  ) {
    return this.getFront(filter) === control;
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

  async alert(input: VStackDynamicDialogInput) {
    const resolvedInput = resolveVStackDynamicInput(input);
    if (!resolvedInput.props.actions) {
      resolvedInput.props.actions = [this.action('ok')];
    }
    if (resolvedInput.props.backdrop == null) {
      resolvedInput.props.backdrop = true;
    }
    return this.dialog(resolvedInput);
  }

  async confirm(input: VStackDynamicDialogInput) {
    const resolvedInput = resolveVStackDynamicInput(input);
    if (!resolvedInput.props.actions) {
      resolvedInput.props.actions = [this.action('cancel'), this.action('ok')];
    }
    if (resolvedInput.props.backdrop == null) {
      resolvedInput.props.backdrop = true;
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

  async menu(input: VStackDynamicMenuInput) {
    const { VMenu } = await import('./components/VMenu');
    const { props, children } = resolveVStackDynamicInput(input);
    return this.dynamic({
      Ctor: markRaw(VMenu),
      props: markRaw(props),
      children,
    });
  }

  async sheet(input: VStackDynamicSheetInput) {
    const resolvedInput = resolveVStackDynamicInput(input);
    const { VSheetModal } = await import('./components/VSheetModal');
    const { props, children } = resolvedInput;
    return this.dynamic({
      Ctor: markRaw(VSheetModal),
      props: markRaw(props),
      children,
    });
  }

  action(
    key: VStackBuiltinActionType,
    override?: Partial<VStackAction>,
    attrs?: Record<string, unknown>,
  ) {
    const factory = this.builtinActions[key];
    const _onClick = BUILTIN_ACTION_HANDLERS[key];
    const action: VStackAction = {
      key,
      content: ({ control, key }) => {
        const onClick = (ev: MouseEvent) => _onClick(control, ev);
        return factory({
          service: this,
          control,
          key,
          bindings: { onClick, ...attrs },
        });
      },
      ...override,
    };
    return action;
  }
}

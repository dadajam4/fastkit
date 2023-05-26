import { Ref, ref, markRaw, ComputedRef, computed } from 'vue';
import { VStackControl } from './schemes/control';
export type { VStackControl } from './schemes/control';
import {
  DynamicStackInternalSetting,
  StackableComponent,
  ExtractDynamicStackProps,
  DefaultContent,
  ExtractDynamicStackSlots,
  DynamicStackPayload,
  resolveDynamicStackSettings,
  StackableLauncher,
} from './schemes/dynamic';
export { VueStackInjectionKey } from './injections';

export interface VueStackServiceOptions {
  zIndex?: number;
  snackbarDefaultPosition?: 'top' | 'bottom';
}

export class VueStackService {
  private readonly _controls: Ref<(() => VStackControl)[]> = ref([]);
  private readonly __controls: ComputedRef<VStackControl[]>;
  readonly zIndex: number;
  readonly snackbarDefaultPosition: 'top' | 'bottom';
  private _increment = 0;
  private readonly _dynamicSettings: Ref<DynamicStackInternalSetting[]> = ref(
    [],
  );

  get controls() {
    return this.__controls.value;
  }

  get dynamicSettings() {
    return this._dynamicSettings.value;
  }

  constructor(opts: VueStackServiceOptions = {}) {
    const { zIndex = 32767, snackbarDefaultPosition = 'top' } = opts;
    this.zIndex = zIndex;
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

  private removeDynamicSetting(setting: DynamicStackInternalSetting) {
    const settings = this._dynamicSettings.value;
    const index = settings.indexOf(setting);
    if (index !== -1) {
      settings.splice(index, 1);
    }
  }

  dynamic<T extends StackableComponent, Payload = any>(
    Ctor: T,
    content: DefaultContent,
  ): DynamicStackPayload<Payload>;
  dynamic<T extends StackableComponent, Payload = any>(
    Ctor: T,
    props: ExtractDynamicStackProps<T>,
    content: DefaultContent,
    propsResolver?: (
      props: ExtractDynamicStackProps<T>,
    ) => ExtractDynamicStackProps<T>,
  ): DynamicStackPayload<Payload>;
  dynamic<T extends StackableComponent, Payload = any>(
    Ctor: T,
    props: ExtractDynamicStackProps<T>,
    slots: ExtractDynamicStackSlots<T>,
    propsResolver?: (
      props: ExtractDynamicStackProps<T>,
    ) => ExtractDynamicStackProps<T>,
  ): DynamicStackPayload<Payload>;
  dynamic<T extends StackableComponent, Payload = any>(
    Ctor: T,
    contentOrProps: DefaultContent | ExtractDynamicStackProps<T>,
    contentOrSlots?: DefaultContent | ExtractDynamicStackSlots<T>,
    propsResolver?: (
      props: ExtractDynamicStackProps<T>,
    ) => ExtractDynamicStackProps<T>,
  ): DynamicStackPayload<Payload> {
    const setting = resolveDynamicStackSettings(
      Ctor,
      contentOrProps,
      contentOrSlots,
      propsResolver,
    );
    return new Promise<any>((resolve, reject) => {
      const _setting: DynamicStackInternalSetting = markRaw({
        id: this.genId(),
        setting,
        resolve,
        reject,
        remove: () => {
          this.removeDynamicSetting(_setting);
        },
      });
      this._dynamicSettings.value.push(_setting);
    });
  }

  createLauncher<T extends StackableComponent, Payload = any>(
    Ctor: T,
    propsResolver?: (
      props: ExtractDynamicStackProps<T>,
    ) => ExtractDynamicStackProps<T>,
  ): StackableLauncher<T, Payload> {
    return ((contentOrProps: any, contentOrSlots: any) =>
      this.dynamic(
        Ctor,
        contentOrProps,
        contentOrSlots,
        propsResolver,
      )) as StackableLauncher<T, Payload>;
  }
}

import { InjectionKey } from 'vue';
import { VStackControl } from './schemes';

export const VueStackInjectionKey: InjectionKey<VueStackService> = Symbol();

export interface VueStackServiceOptions {
  zIndex?: number;
}

export class VueStackService {
  readonly controls: VStackControl[] = [];
  readonly zIndex: number;

  constructor(opts: VueStackServiceOptions = {}) {
    const { zIndex = 32767 } = opts;
    this.zIndex = zIndex;
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
}

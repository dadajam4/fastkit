import {
  App,
  Ref,
  inject,
  ref,
  markRaw,
  reactive,
  UnwrapNestedRefs,
} from 'vue';
import { VueAppLayoutPositionX, VueAppDrawerId } from '../schemes';
import { VAL_INJECTION_KEY } from './injections';
import { VueAppLayoutError } from '../logger';
import { VueAppStack, VueAppStackSettings } from './stack';
import {
  VueAppDrawer,
  VueAppDrawerSettings,
  VueAppDrawerControl,
} from './drawer';
import { VueAppBar, VueAppBarSettings } from './bar';
import { installResizeDirective, useWindow } from '@fastkit/vue-resize';
import { installBodyScrollLockDirective } from '@fastkit/vue-body-scroll-lock';
import { getDocumentScroller, UseScroller } from '@fastkit/vue-scroller';
import { IN_WINDOW } from '@fastkit/helpers';

export function useVueAppLayout(): VueAppLayout {
  const layout = inject(VAL_INJECTION_KEY);
  if (!layout) {
    throw new VueAppLayoutError(`missing provided VueAppLayout`);
  }
  return layout;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $appLayout: VueAppLayout;
  }
}

export interface VueAppLayoutViewportOffsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface VueAppLayoutViewportRect extends VueAppLayoutViewportOffsets {
  width: number;
  height: number;
}

export class VueAppLayout {
  static use(): VueAppLayout {
    return useVueAppLayout();
  }

  static install(app: App) {
    const layout = new VueAppLayout();
    app.config.globalProperties.$appLayout = layout;
    app.provide(VAL_INJECTION_KEY, layout);
  }

  private _drawers: Ref<VueAppDrawer[]> = ref([]);
  readonly window = useWindow();
  readonly scroller: UseScroller = getDocumentScroller();

  readonly offset: UnwrapNestedRefs<VueAppLayoutViewportOffsets> = reactive({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  get viewportRect(): VueAppLayoutViewportRect {
    return {
      ...this.offset,
      width: this.window.width,
      height: this.window.height,
    };
  }

  private _scrollerOffset() {
    return -this.offset.top;
  }

  constructor() {
    this._scrollerOffset = this._scrollerOffset.bind(this);
    IN_WINDOW &&
      this.scroller.setScrollToElementAddtionalOffset(this._scrollerOffset);
  }

  get drawers() {
    return this._drawers.value;
  }

  createDrawerControl(id?: VueAppDrawerId) {
    return new VueAppDrawerControl(this, id);
  }

  launchDrawer(settings: VueAppDrawerSettings): VueAppDrawer {
    const drawer = markRaw(new VueAppDrawer(this, settings));
    this._drawers.value.push(drawer);
    return drawer;
  }

  disposeDrawer(drawer: VueAppDrawer) {
    this._drawers.value = this._drawers.value.filter(
      (target) => target !== drawer,
    );
  }

  getDrawerById(id: VueAppDrawerId) {
    return this.drawers.find((drawer) => drawer.id === id);
  }

  getDrawers(position?: VueAppLayoutPositionX) {
    const { drawers } = this;
    return position
      ? drawers.filter((drawer) => drawer.position === position)
      : drawers;
  }

  openDrawer(position?: VueAppLayoutPositionX) {
    this.getDrawers(position).forEach((drawer) => drawer.open());
  }

  closeDrawer(position?: VueAppLayoutPositionX) {
    this.getDrawers(position).forEach((drawer) => drawer.close());
  }

  toggleDrawer(position?: VueAppLayoutPositionX) {
    this.getDrawers(position).forEach((drawer) => drawer.toggle());
  }

  drawerIsStatic(position?: VueAppLayoutPositionX) {
    return this.getDrawers(position).some((drawer) => drawer.isStatic);
  }

  launchBar(settings: VueAppBarSettings): VueAppBar {
    const bar = markRaw(new VueAppBar(this, settings));
    return bar;
  }

  launchStack(
    settings: VueAppStackSettings,
    emit: (modelValue: boolean) => void,
  ): VueAppStack {
    const stack = markRaw(new VueAppStack(this, settings, emit));
    return stack;
  }

  calicurateViewHeight(height: number | string, adds = 0, minHeight = 0) {
    if (typeof height === 'number')
      return `${Math.max(height + adds, minHeight)}px`;
    const perMatch = height.match(/([\d.]+)%$/);
    if (!perMatch) return height;
    const num = Number(perMatch[1]);
    return isNaN(num)
      ? height
      : `${Math.max(
          (this.viewportRect.height * num) / 100 + adds,
          minHeight,
        )}px`;
  }
}

export function installVueAppLayout(app: App) {
  installBodyScrollLockDirective(app);
  installResizeDirective(app);
  return app.use(VueAppLayout);
}

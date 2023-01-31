import { reactive, provide, inject, ref } from 'vue';
import {
  createDefaultState,
  State,
  ITEM_LEVELS,
  SystemBarState,
  ToolbarState,
  DrawerState,
  ItemLevel,
  ItemType,
  EditorItemModel,
  ItemStateAt,
  createSystemBarState,
  createToolbarState,
  createDrawerState,
} from './-schemes';
import { PLAYGROUND_CONTEXT_INJECTION_KEY } from './-injections';
import {
  VueAppLayout,
  VueAppLayoutPositionY,
  VueAppLayoutPositionX,
} from '@fastkit/vue-app-layout';

export class PlaygroundContext {
  static use() {
    const ctx = inject(PLAYGROUND_CONTEXT_INJECTION_KEY);
    if (!ctx) throw new Error('missing provided PlaygroundContext');
    return ctx;
  }

  readonly layout: VueAppLayout;
  readonly state: State;
  private readonly _edting = ref(false);

  readonly drawerId = {
    main: 'playground-main',
    sub: 'playground-sub',
  };

  get edting() {
    return this._edting.value;
  }

  set edting(edting) {
    this._edting.value = edting;
  }

  get systemBarStates() {
    const states: SystemBarState[] = [];
    ITEM_LEVELS.forEach((level) => {
      const state = this.state.systemBar[level];
      state && states.push(state);
    });
    return states;
  }

  get toolbarStates() {
    const states: ToolbarState[] = [];
    ITEM_LEVELS.forEach((level) => {
      const state = this.state.toolbar[level];
      state && states.push(state);
    });
    return states;
  }

  get drawerStates() {
    const states: DrawerState[] = [];
    ITEM_LEVELS.forEach((level) => {
      const state = this.state.drawer[level];
      state && states.push(state);
    });
    return states;
  }

  constructor() {
    this.layout = VueAppLayout.use();
    this.state = reactive<State>(createDefaultState());
    provide(PLAYGROUND_CONTEXT_INJECTION_KEY, this);

    this.createSystemBarState = this.createSystemBarState.bind(this);
    this.createToolbarState = this.createToolbarState.bind(this);
    this.createDrawerState = this.createDrawerState.bind(this);
  }

  getSystemBarStateByPosition(position: VueAppLayoutPositionY) {
    return this.systemBarStates.find((state) => state.position === position);
  }

  getToolbarStateByPosition(position: VueAppLayoutPositionY) {
    return this.toolbarStates.find((state) => state.position === position);
  }

  getDrawerStateByPosition(position: VueAppLayoutPositionX) {
    return this.drawerStates.find((state) => state.position === position);
  }

  getDrawerByLevel(level: ItemLevel) {
    const drawer = this.layout.getDrawerById(this.drawerId[level]);
    if (!drawer) throw new Error(`missing drawer level at ${level}`);
    return drawer;
  }

  private getEditorItemState<Type extends ItemType>(
    itemType: Type,
    level: ItemLevel,
    defaults: () => ItemStateAt[Type],
  ): EditorItemModel<ItemStateAt[Type]> {
    const { state } = this;
    const itemState = state[itemType][level] as ItemStateAt[Type] | undefined;
    return {
      level,
      state: itemState,
      get use() {
        return !!itemState;
      },
      set use(use) {
        if (use) {
          state[itemType][level] = defaults();
        } else {
          state[itemType][level] = undefined;
        }
      },
    };
  }

  createSystemBarState() {
    return createSystemBarState(this.state);
  }

  createToolbarState() {
    return createToolbarState(this.state);
  }

  createDrawerState() {
    return createDrawerState(this.state);
  }

  mapSystemBarModels<T>(
    cb: (state: EditorItemModel<SystemBarState>) => T,
  ): T[] {
    return ITEM_LEVELS.map((level) => {
      const itemState = this.getEditorItemState(
        'systemBar',
        level,
        this.createSystemBarState,
      );
      return cb(itemState);
    });
  }

  mapToolbarModels<T>(cb: (state: EditorItemModel<ToolbarState>) => T): T[] {
    return ITEM_LEVELS.map((level) => {
      const itemState = this.getEditorItemState(
        'toolbar',
        level,
        this.createToolbarState,
      );
      return cb(itemState);
    });
  }

  mapDrawerModels<T>(cb: (state: EditorItemModel<DrawerState>) => T): T[] {
    return ITEM_LEVELS.map((level) => {
      const itemState = this.getEditorItemState(
        'drawer',
        level,
        this.createDrawerState,
      );
      return cb(itemState);
    });
  }
}

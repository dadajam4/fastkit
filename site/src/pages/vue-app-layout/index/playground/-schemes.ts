import {
  VueAppLayoutPositionX,
  VueAppLayoutPositionY,
  VueAppDrawerResolvedStickedSettings,
  VAL_STACK_DEFAULT_POSITION_Y,
  VAL_DRAWER_DEFAULT_POSITION,
} from '@fastkit/vue-app-layout';

export const ITEM_LEVELS = ['main', 'sub'] as const;

export type ItemLevel = (typeof ITEM_LEVELS)[number];

export const ITEM_TYPES = ['systemBar', 'toolbar', 'drawer'] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type ItemLevelsState<T> = Partial<Record<ItemLevel, T>>;

export interface BarState {
  position: VueAppLayoutPositionY;
  active: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SystemBarState extends BarState {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ToolbarState extends BarState {}

export interface DrawerState {
  position: VueAppLayoutPositionX;
  sticked: VueAppDrawerResolvedStickedSettings;
  backdrop: boolean;
  static: boolean;
  rale: boolean;
}

export type ItemStateAt = {
  systemBar: SystemBarState;
  toolbar: ToolbarState;
  drawer: DrawerState;
};

export interface State {
  systemBar: ItemLevelsState<SystemBarState>;
  toolbar: ItemLevelsState<ToolbarState>;
  drawer: ItemLevelsState<DrawerState>;
}

export function createBarState(
  type: 'systemBar' | 'toolbar',
  state?: State,
): BarState {
  const hasTop = state
    ? state[type].main?.position === 'top' ||
      state[type].sub?.position === 'top' ||
      false
    : false;

  return {
    position: hasTop ? 'bottom' : 'top',
    active: true,
  };
}

export function createSystemBarState(state?: State): SystemBarState {
  return createBarState('systemBar', state);
}

export function createToolbarState(state?: State): SystemBarState {
  return createBarState('toolbar', state);
}

const DRAWER_ALTERNATE_POSITION: VueAppLayoutPositionX =
  VAL_DRAWER_DEFAULT_POSITION === 'left'
    ? 'right'
    : VAL_DRAWER_DEFAULT_POSITION;

export function createDrawerState(state?: State): DrawerState {
  const hasDefault = state
    ? state.drawer.main?.position === VAL_DRAWER_DEFAULT_POSITION ||
      state.drawer.sub?.position === VAL_DRAWER_DEFAULT_POSITION ||
      false
    : false;

  return {
    position: hasDefault
      ? DRAWER_ALTERNATE_POSITION
      : VAL_DRAWER_DEFAULT_POSITION,
    sticked: {
      top: VAL_STACK_DEFAULT_POSITION_Y,
      bottom: VAL_STACK_DEFAULT_POSITION_Y,
    },
    backdrop: true,
    static: false,
    rale: false,
  };
}

export function createDefaultState(): State {
  return {
    systemBar: {
      main: createSystemBarState(),
    },
    toolbar: {
      main: createToolbarState(),
    },
    drawer: {
      main: createDrawerState(),
    },
  };
}

export interface EditorItemModel<T> {
  level: ItemLevel;
  state?: T;
  use: boolean;
}

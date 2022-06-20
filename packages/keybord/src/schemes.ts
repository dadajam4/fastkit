/**
 * ## See Also
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#special_values}
 */
export type KeyTypeSpecial = 'Unidentified';

export function Special<T extends KeyTypeSpecial | KeyTypeSpecial[]>(key: T) {
  return key as T;
}

export type KeyTypeModifier =
  | 'Alt'
  | 'AltGraph'
  | 'CapsLock'
  | 'Control'
  | 'Fn'
  | 'FnLock'
  | 'Hyper'
  | 'Meta'
  | 'NumLock'
  | 'ScrollLock'
  | 'Shift'
  | 'Super'
  | 'Symbol'
  | 'SymbolLock';
export function Modifier<T extends KeyTypeModifier | KeyTypeModifier[]>(
  key: T,
) {
  return key as T;
}

export type KeyTypeWhitespace = 'Enter' | 'Tab' | ' ';
export function Whitespace<T extends KeyTypeWhitespace | KeyTypeWhitespace[]>(
  key: T,
) {
  return key as T;
}

export type KeyTypeNavigation =
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'End'
  | 'Home'
  | 'PageDown'
  | 'PageUp';
export function Navigation<T extends KeyTypeNavigation | KeyTypeNavigation[]>(
  key: T,
) {
  return key as T;
}

export type KeyTypeEditing =
  | 'Backspace'
  | 'Clear'
  | 'Copy'
  | 'CrSel'
  | 'Cut'
  | 'Delete'
  | 'EraseEof'
  | 'ExSel'
  | 'Insert'
  | 'Paste'
  | 'Redo'
  | 'Undo';
export function Editing<T extends KeyTypeEditing | KeyTypeEditing[]>(key: T) {
  return key as T;
}

export type KeyTypeUI =
  | 'Accept'
  | 'Again'
  | 'Attn'
  | 'Cancel'
  | 'ContextMenu'
  | 'Escape'
  | 'Execute'
  | 'Find'
  | 'Finish'
  | 'Help'
  | 'Pause'
  | 'Play'
  | 'Props'
  | 'Select'
  | 'ZoomIn'
  | 'ZoomOut';
export function UI<T extends KeyTypeUI | KeyTypeUI[]>(key: T) {
  return key as T;
}

export type KeyTypeCommonIME =
  | 'AllCandidates'
  | 'Alphanumeric'
  | 'CodeInput'
  | 'Compose'
  | 'Convert'
  | 'Dead'
  | 'FinalMode'
  | 'GroupFirst'
  | 'GroupLast'
  | 'GroupNext'
  | 'GroupPrevious'
  | 'ModeChange'
  | 'NextCandidate'
  | 'NonConvert'
  | 'PreviousCandidate'
  | 'Process'
  | 'SingleCandidate';
export function CommonIME<T extends KeyTypeCommonIME | KeyTypeCommonIME[]>(
  key: T,
) {
  return key as T;
}

export type KeyTypeKorean = 'HangulMode' | 'HanjaMode' | 'JunjaMode';
export function Korean<T extends KeyTypeKorean | KeyTypeKorean[]>(key: T) {
  return key as T;
}

export type KeyTypeJapanese =
  | 'Eisu'
  | 'Hankaku'
  | 'Hiragana'
  | 'HiraganaKatakana'
  | 'KanaMode'
  | 'KanjiMode'
  | 'Katakana'
  | 'Romaji'
  | 'Zenkaku'
  | 'ZenkakuHanaku';
export function Japanese<T extends KeyTypeJapanese | KeyTypeJapanese[]>(
  key: T,
) {
  return key as T;
}

export type KeyTypeFunction =
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'F13'
  | 'F14'
  | 'F15'
  | 'F16'
  | 'F17'
  | 'F18'
  | 'F19'
  | 'F20'
  | 'Soft1'
  | 'Soft2'
  | 'Soft3'
  | 'Soft4';
export function Function<T extends KeyTypeFunction | KeyTypeFunction[]>(
  key: T,
) {
  return key as T;
}

export type KeyType =
  | KeyTypeModifier
  | KeyTypeWhitespace
  | KeyTypeNavigation
  | KeyTypeEditing
  | KeyTypeUI
  | KeyTypeCommonIME
  | KeyTypeKorean
  | KeyTypeJapanese
  | KeyTypeFunction;
export const Key: Key = function Key<T extends KeyType | KeyType[]>(key: T) {
  return key as T;
};
export interface Key {
  <T extends KeyType | KeyType[]>(key: T): T;
  Special: typeof Special;
  Modifier: typeof Modifier;
  Whitespace: typeof Whitespace;
  Navigation: typeof Navigation;
  Editing: typeof Editing;
  UI: typeof UI;
  CommonIME: typeof CommonIME;
  Korean: typeof Korean;
  Japanese: typeof Japanese;
  Function: typeof Function;
  is<T extends KeyType | KeyType[] | Readonly<KeyType[]>>(
    source: any,
    key: T,
  ): source is KeyType;
}
Key.Special = Special;
Key.Modifier = Modifier;
Key.Whitespace = Whitespace;
Key.Navigation = Navigation;
Key.Editing = Editing;
Key.UI = UI;
Key.CommonIME = CommonIME;
Key.Korean = Korean;
Key.Japanese = Japanese;
Key.Function = Function;
Key.is = function is(source, key): source is KeyType {
  return Array.isArray(key) ? key.includes(source) : key === source;
};

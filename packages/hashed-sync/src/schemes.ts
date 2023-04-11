import type { processors } from './processors';

/**
 * 更新情報種別
 */
export enum UpdateType {
  /**
   * 新規追加
   */
  ADD = 'add',

  /**
   * 更新
   */
  UPDATE = 'update',

  /**
   * 削除
   */
  REMOVE = 'remove',
}

/**
 * 同期アイテム
 */
export interface SyncItem {
  /** 同期元ファイルのフルパス */
  src: string;

  /** 同期先ファイルのフルパス */
  dest: string;

  /** 同期元ファイルのハッシュ */
  hash: string;
}

/**
 * 同期情報
 */
export interface UpdateInfo {
  /** 同期元ファイルのフルパス */
  src: string;

  /** 同期先ファイルのフルパス */
  dest: string;

  /** 変更タイプ */
  type: UpdateType;
}

/** 比較結果 */
export interface CompareResult {
  /** 同期元ファイルのフルパス */
  src: string;

  /** 同期先ファイルのフルパス */
  dest: string;

  /** メタ保存先ディレクトリのフルパス */
  metaDir: string;

  /** 履歴保存先パス */
  historyPath: string;

  /** 現在の全ハッシュ状況 */
  current: SyncItem[];

  /** 前回の全ハッシュ状況 */
  before: SyncItem[];

  /** 削除されたファイルリスト */
  removes: UpdateInfo[];

  /** 更新されたファイルリスト */
  updates: UpdateInfo[];

  /** 削除or更新されたファイルリスト */
  updateInformations: UpdateInfo[];
}

export interface HashedSyncProcessor {
  name: string;
  match(update: UpdateInfo): boolean;
  proc(updates: UpdateInfo[]): Promise<void>;
}

export interface HashedSyncProcessorStack {
  processor: HashedSyncProcessor;
  updates: UpdateInfo[];
}

export interface HashedSyncOptions {
  /**
   * 同期元ディレクトリ
   */
  src: string;

  /**
   * 同期先ディレクトリ
   */
  dest: string;

  /**
   * 同期処理プロセッサー or 同期処理プロセッサー名の配列
   */
  processors?: (HashedSyncProcessor | keyof typeof processors)[];

  watch?: boolean;
}

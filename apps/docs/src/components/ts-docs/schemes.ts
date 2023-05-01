import {
  AnyMeta,
  ObjectMemberMeta,
  MetaDoc,
  SignatureMeta,
  ObjectMembers,
} from '@fastkit/ts-tiny-meta';

export type MetaType = 'function' | 'class';

export interface TypeSummary {
  text: string;
  docs: MetaDoc[];
}

export interface PropertyInfo {
  static: boolean;
  readonly: boolean;
  optional: boolean;
  // modifiers: {
  //   readonly: boolean;
  //   optional: boolean;
  // };
}

export interface MetaInfo {
  __metaInfo: true;
  name: string;
  type?: MetaType;
  property?: PropertyInfo;
  /**
   * オリジナルの種別がfunctionかmethodの時はオーバーロード定義の可能性があるので未設定
   */
  docs?: MetaDoc[];
  /**
   * オリジナルの種別がfunctionかmethodの時はオーバーロード定義の可能性があるので未設定
   * クラスであったり何らかのメンバやプロパティを保有している時はそっちが説明になるので不要なので未設定
   */
  text?: string;
  // summary?: TypeSummary;
  constructors?: SignatureMeta[];
  signatures?: SignatureMeta[];
  properties?: MetaInfo[];
  staticMembers?: MetaInfo[];
}

function normalizeProperties(
  properties: ObjectMembers<any>,
  options?: NormalizeMetaOptions,
  // isStatic?: boolean,
): MetaInfo[] | undefined {
  const entries = Object.entries(properties);
  const results = entries.map(([_name, meta]) => {
    const info = normalizeMeta(meta, options);
    return info;
  });
  return results.length > 0 ? results : undefined;
}

function isMetaInfo(source: unknown): source is MetaInfo {
  return (
    !!source &&
    '__metaInfo' in (source as MetaInfo) &&
    (source as MetaInfo).__metaInfo
  );
}

function normalizeSigunaturesLength(
  signatures: SignatureMeta[],
): SignatureMeta[] {
  const cloned = [...signatures];
  if (cloned.length > 1) cloned.pop();
  return cloned;
}

interface NormalizeMetaOptions {
  static?: boolean;
  parent?: AnyMeta | ObjectMemberMeta;
}

export function normalizeMeta(
  meta: MetaInfo | AnyMeta | ObjectMemberMeta,
  options?: NormalizeMetaOptions,
  // isStatic = false,
): MetaInfo {
  if (isMetaInfo(meta)) return meta;
  const overloadable = meta.kind === 'function' || meta.kind === 'method';
  // const namePrefix =
  //   options?.parent?.kind === 'function' && options?.parent?.name
  //     ? `${options.parent.name}.`
  //     : '';
  // const name = `${namePrefix}${meta.name}`;
  const name = `${meta.name}`;
  const docs: MetaDoc[] | undefined = overloadable ? undefined : meta.docs;
  const constructors =
    'constructors' in meta
      ? normalizeSigunaturesLength(meta.constructors)
      : undefined;
  const signatures =
    'signatures' in meta
      ? normalizeSigunaturesLength(meta.signatures)
      : undefined;

  let type: MetaType | undefined;
  let property: PropertyInfo | undefined;
  let text: string | undefined;
  let properties: MetaInfo[] | undefined;
  let staticMembers: MetaInfo[] | undefined;

  if ('properties' in meta) {
    properties = normalizeProperties(meta.properties, { parent: meta });
  }
  if ('members' in meta) {
    properties = normalizeProperties(meta.members);
  }

  if ('staticMembers' in meta) {
    staticMembers = normalizeProperties(meta.staticMembers, { static: true });
  }

  // console.log(meta.kind);

  if (constructors) {
    type = 'class';
  } else if (signatures) {
    type = 'function';
  } else if (meta.kind === 'property') {
    // console.log(meta.types);
    // for (const hoge of meta.types) {
    //   console.log(hoge);
    // }
  }

  if (!overloadable && type !== 'class' && !properties && !staticMembers) {
    text = meta.text;
  }

  if (meta.kind === 'property') {
    property = {
      static: options?.static || false,
      readonly: meta.readonly,
      optional: meta.optional,
    };
  }

  return {
    __metaInfo: true,
    name,
    type,
    property,
    docs,
    text,
    constructors,
    signatures,
    properties,
    staticMembers,
  };
}

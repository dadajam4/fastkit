import {
  Node,
  JSDoc,
  JSDocText,
  JSDocLink,
  JSDocLinkCode,
  JSDocLinkPlain,
  JSDocTag,
  Symbol as MorphSymbol,
  JSDocTagInfo,
  SyntaxKind,
} from 'ts-morph';
import * as ts from 'typescript';

import {
  MetaDoc,
  MetaDocLink,
  MetaDocLinkSummary,
  MetaDocLinkType,
  MetaDocPart,
  ParsedComment,
  ParsedTag,
  ParameterDoc,
  ParameterDocs,
} from '../../types';
import { SourceFileExporter } from '../source-file-exporter';

type JSDocCommentNode =
  | { text: string; getText(): string }
  | JSDocText
  | JSDocLink
  | JSDocLinkCode
  | JSDocLinkPlain;

export function getLinkSourceFromJSDocCommentNode(node: JSDocCommentNode):
  | {
      type: MetaDocLinkType;
      link: JSDocLink | JSDocLinkCode | JSDocLinkPlain;
    }
  | undefined {
  if (!Node.isNode(node) || Node.isJSDocText(node)) return;
  let type: MetaDocLinkType | undefined;
  if (Node.isJSDocLinkPlain(node)) {
    type = 'linkPlain';
  } else if (Node.isJSDocLinkCode(node)) {
    type = 'linkCode';
  } else if (Node.isJSDocLink(node)) {
    type = 'link';
  }
  return (
    type && {
      type,
      link: node,
    }
  );
}

const LINK_TEXT_PARSE_RE = /^([^\s]+)(\s+)?(.*)?$/;

type JSDocCommentType =
  ReturnType<JSDocTag['getComment']> | ts.SymbolDisplayPart[];

export function normalizeJSDocComment(
  comment: JSDocCommentType,
): JSDocCommentNode[] {
  if (!comment) return [];
  if (typeof comment === 'string') {
    return [
      {
        text: comment,
        getText: () => comment,
      },
    ];
  }
  const nodes: JSDocCommentNode[] = [];
  comment.forEach((node) => {
    if (!node) return;
    if ('getText' in node) {
      nodes.push(node);
    } else if (node.kind !== 'link') {
      nodes.push({
        text: node.text,
        getText: () => node.text,
      });
    }
  });
  return nodes;
}

/**
 * Read a comment node as documentation text, with the comment syntax off.
 *
 * `getText()` returns the node's span of the **source file**, so on a
 * multi-line comment it carries the `/**` opener and every ` * ` line prefix
 * along with it. A `JSDocText` node also carries `text`, which TypeScript has
 * already stripped, and that is what documentation wants.
 *
 * The distinction only shows up when a comment contains a `{@link}`: without
 * one, `getComment()` hands back a plain string that TypeScript has already
 * cleaned, and the two agree. With one, it hands back nodes, and they do not.
 *
 * Link nodes keep `getText()` on purpose: `{@link Foo.bar baz}` is what belongs
 * in the flattened text, while {@link MetaDocPart.link} carries it structured.
 */
function readCommentNodeText(node: JSDocCommentNode): string {
  if (Node.isNode(node) && Node.isJSDocText(node)) {
    return node.compilerNode.text;
  }
  // The non-node shapes are built from an already-plain string, so their
  // `getText()` is that string.
  return node.getText();
}

type AnyJSDocLink = JSDocLink | JSDocLinkCode | JSDocLinkPlain;

/**
 * A `{@link}` tag, split into where it points and what it reads as.
 *
 * TypeScript hands the tag over already halved, but along a seam that does not
 * match the two forms the tag actually has: `name` is the first token and
 * `text` is the rest, so a URL arrives as `"https"` plus `"://example.com Label"`
 * while a symbol reference arrives as `"Api.other"` plus `"other"`.
 */
interface ParsedLinkTag {
  /** What the link reads as */
  label: string;
  /** Where the link points, as written */
  location: string;
  /** `true` when {@link ParsedLinkTag.location} is a URL, not a symbol reference */
  isUrl: boolean;
}

function parseLinkTag(link: AnyJSDocLink): ParsedLinkTag | undefined {
  const { name } = link.compilerNode;
  if (!name) return;

  const linkText = link.compilerNode.text;
  const nameText = name.getText();

  if (linkText.startsWith('://')) {
    // `{@link https://example.com Label}` -> "https" + "://example.com Label"
    const parsed = linkText.match(LINK_TEXT_PARSE_RE);
    if (!parsed) return;
    const location = nameText + parsed[1];
    return { label: parsed[3] || location, location, isUrl: true };
  }

  // `{@link Api.other other}` -> "Api.other" + "other", a symbol reference.
  // A tag written without a label -- `{@link Api}` -- has no text at all, so
  // the reference itself has to stand in for one.
  return { label: linkText || nameText, location: nameText, isUrl: false };
}

/** Cap on how much of a declaration a link summary carries. */
const SUMMARY_MAX_LINES = 20;

function unwrapAliasSymbol(symbol: MorphSymbol): MorphSymbol {
  return symbol.getAliasedSymbol() || symbol;
}

/**
 * Read the reference out of a link node.
 *
 * `compilerNode.name` is the same reference, but as a raw compiler node, and
 * resolving a symbol from one of those means reaching into ts-morph's node
 * factory. The wrapped child is the same thing with the public API attached.
 */
function getLinkNameNode(link: AnyJSDocLink): Node | undefined {
  return (
    link.getFirstChildByKind(SyntaxKind.QualifiedName) ??
    link.getFirstChildByKind(SyntaxKind.Identifier)
  );
}

/**
 * Flatten a comment for a link preview.
 *
 * A nested `{@link}` collapses to its label. A preview is one level deep, so
 * it has nowhere to put a link of its own -- and resolving one would let two
 * symbols that reference each other recurse forever.
 */
function flattenCommentForSummary(comment: JSDocCommentType): string {
  return normalizeJSDocComment(comment)
    .map((node) => {
      const extracted = getLinkSourceFromJSDocCommentNode(node);
      if (!extracted) return readCommentNodeText(node);
      return parseLinkTag(extracted.link)?.label ?? '';
    })
    .join('');
}

function buildLinkSummary(link: AnyJSDocLink): MetaDocLinkSummary | undefined {
  const nameNode = getLinkNameNode(link);
  const symbol = nameNode?.getSymbol();
  if (!symbol) return;

  const [declaration] = unwrapAliasSymbol(symbol).getDeclarations();
  if (!declaration) return;

  const lines = declaration.getText().split('\n');
  const truncated = lines.length > SUMMARY_MAX_LINES;
  const summary: MetaDocLinkSummary = {
    text: (truncated ? lines.slice(0, SUMMARY_MAX_LINES) : lines).join('\n'),
  };
  if (truncated) summary.truncated = true;
  if (declaration.getSourceFile().isInNodeModules()) summary.external = true;

  if (Node.isJSDocable(declaration)) {
    const [jsDoc] = declaration.getJsDocs();
    const description = jsDoc && flattenCommentForSummary(jsDoc.getComment());
    if (description) summary.description = description.trim();
  }

  return summary;
}

export function extractMetaDocPartsFromJSDocComment(
  comment: JSDocCommentType,
  isParameter?: boolean,
): MetaDocPart[] {
  const normalizedNodes = normalizeJSDocComment(comment);
  const parts: MetaDocPart[] = [];
  normalizedNodes.forEach((node, nodeIndex) => {
    const part: MetaDocPart = {
      text: readCommentNodeText(node),
    };
    if (isParameter && nodeIndex === 0) {
      part.text = part.text
        .replace(PARAMETER_NAME_MATCH_RE, '')
        .replace(/^-?\s*/, '');
    }

    parts.push(part);
    const linkExtracted = getLinkSourceFromJSDocCommentNode(node);
    if (!linkExtracted) return;

    const { type, link } = linkExtracted;
    const parsed = parseLinkTag(link);
    if (!parsed) return;

    const metaLink: MetaDocLink = { type, name: parsed.label };

    if (parsed.isUrl) {
      metaLink.url = parsed.location;
    } else {
      // A symbol reference is not a URL, and `url` promises one. Hand the
      // reference over as what it is, with a preview of what it resolves to
      // when it resolves at all.
      metaLink.target = parsed.location;
      const summary = buildLinkSummary(link);
      if (summary) metaLink.summary = summary;
    }

    part.link = metaLink;
  });
  return parts;
}

/**
 * @TODO ちゃんとかく
 *
 * @param parts
 * @returns
 */
export function metaDocPartToString(parts: MetaDocPart[]): string {
  return parts.map((part) => part.text).join('');
}

export function parseJSDocComment(
  comment: JSDocCommentType,
  isParameter?: boolean,
): ParsedComment {
  const parts = extractMetaDocPartsFromJSDocComment(comment, isParameter);
  return {
    text: metaDocPartToString(parts),
    parts,
  };
}

const PARAMETER_NAME_MATCH_RE = /^(@param\s)?([^\s]+)\s/;

function displayPartsToString(parts: ts.SymbolDisplayPart[]) {
  return parts
    .filter((part) => part.kind !== 'link')
    .map((part) => part.text)
    .join('');
}

function normalizeTag(tag: JSDocTag | JSDocTagInfo): {
  name: string;
  text: string;
  getComment(): ReturnType<JSDocTag['getComment']>;
} {
  if (tag instanceof JSDocTag) {
    return {
      name: tag.getTagName(),
      text: tag.getText(),
      getComment: () => tag.getComment(),
    };
  }

  return {
    name: tag.getName(),
    text: displayPartsToString(tag.getText()),
    getComment: () => displayPartsToString(tag.getText()),
  };
}

export function parseJSDocTags(tags: JSDocTag[] | JSDocTagInfo[]): {
  tags: ParsedTag[];
  params: ParameterDocs;
} {
  const result: {
    tags: ParsedTag[];
    params: ParameterDocs;
  } = {
    tags: [],
    params: {},
  };

  tags.forEach((tag) => {
    const normalized = normalizeTag(tag);
    const { name } = normalized;
    if (name === 'param') {
      const parameterName = normalized.text.match(PARAMETER_NAME_MATCH_RE)?.[2];
      if (!parameterName) return;
      const docs: ParameterDoc[] = [
        {
          parameterName,
          ...parseJSDocComment(normalized.getComment(), true),
        },
      ];
      result.params[parameterName] = docs;
      return;
    }
    result.tags.push({
      name,
      ...parseJSDocComment(normalized.getComment()),
    });
  });

  return result;
}

export function serializeJSDoc(jsDoc: JSDoc): MetaDoc {
  const comment = jsDoc.getComment();
  return {
    description: parseJSDocComment(comment),
    ...parseJSDocTags(jsDoc.getTags()),
  };
}

type GetMetaDocSource = JSDoc | JSDoc[] | undefined | null;

export function getMetaDocs(source: GetMetaDocSource): MetaDoc[] {
  if (!source) return [];
  const jsDocs = Array.isArray(source) ? source : [source];
  return jsDocs.map((jsDoc) => serializeJSDoc(jsDoc));
}

const PRIVATE_LIKE_TAGS = ['private', 'internal', 'ignore'] as const;

type PrivateLikeTag = (typeof PRIVATE_LIKE_TAGS)[number];

function isPrivateLikeTag(tag: string): tag is PrivateLikeTag {
  return PRIVATE_LIKE_TAGS.includes(tag as PrivateLikeTag);
}

export function hasPrivateLikeTag(docs: MetaDoc[]) {
  return (
    !!docs &&
    docs.some((doc) => doc.tags.some((tag) => isPrivateLikeTag(tag.name)))
  );
}

export function getMetaDocsBySymbol(
  exporter: SourceFileExporter,
  symbol: MorphSymbol,
): MetaDoc[] {
  const comment = symbol.compilerSymbol.getDocumentationComment(
    exporter.workspace.project.getTypeChecker().compilerObject,
  );
  const description = parseJSDocComment(comment);
  const tags = parseJSDocTags(symbol.getJsDocTags());
  if (!description.text && tags.tags.length === 0) {
    return [];
  }
  const doc: MetaDoc = {
    description,
    ...tags,
  };
  return [doc];
}

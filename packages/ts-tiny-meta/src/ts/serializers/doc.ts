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
} from 'ts-morph';
import * as ts from 'typescript';

import {
  MetaDoc,
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
  | ReturnType<JSDocTag['getComment']>
  | ts.SymbolDisplayPart[];

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
    } else {
      if (node.kind !== 'link') {
        nodes.push({
          text: node.text,
          getText: () => node.text,
        });
      }
      // console.log('★★★★', node.text);
      // nodes.push({
      //   text: node.text,
      //   getText: () => node.text,
      // });
    }
    // node && nodes.push(node);
  });
  return nodes;
}

// function normalizeSymbolDisplayParts(
//   parts: ts.SymbolDisplayPart[],
// ): JSDocCommentNode[] {
//   return parts.map((part) => {
//     return {
//       text: part.text,
//       getText: () => part.text,
//     };
//   });
// }

// function extractMetaDocPartsFromSymbolDisplayParts(
//   parts: ts.SymbolDisplayPart[],
// ) {
//   const normalizedNodes = normalizeSymbolDisplayParts(parts);
// }

export function extractMetaDocPartsFromJSDocComment(
  comment: JSDocCommentType,
  isParameter?: boolean,
): MetaDocPart[] {
  const normalizedNodes = normalizeJSDocComment(comment);
  const parts: MetaDocPart[] = [];
  normalizedNodes.forEach((node, nodeIndex) => {
    const part: MetaDocPart = {
      text: node.getText(),
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

    const { name } = link.compilerNode;
    if (!name) return;
    const linkText = link.compilerNode.text;
    const nameText = name.getText();

    let linkLocation = '';
    let linkLabel = '';

    if (linkText.startsWith('://')) {
      const parsed = linkText.match(LINK_TEXT_PARSE_RE);
      if (parsed) {
        linkLocation = nameText + parsed[1];
        linkLabel = parsed[3] || linkLocation;
      }
    } else {
      linkLocation = nameText;
      linkLabel = linkText;
    }

    part.link = {
      type,
      name: linkLabel,
      url: linkLocation,
    };
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
  return parts
    .map((part) => {
      return part.text;
    })
    .join('');
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
    const name = normalized.name;
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
    docs.some((doc) => {
      return doc.tags.some((tag) => isPrivateLikeTag(tag.name));
    })
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

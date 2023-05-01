import {
  Node,
  JSDoc,
  JSDocText,
  JSDocLink,
  JSDocLinkCode,
  JSDocLinkPlain,
  JSDocTag,
} from 'ts-morph';

import {
  MetaDoc,
  MetaDocLinkType,
  MetaDocPart,
  ParsedComment,
  ParsedTag,
  ParameterDoc,
  ParameterDocs,
} from '../../types';

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

type JSDocCommentType = ReturnType<JSDocTag['getComment']>;

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
    node && nodes.push(node);
  });
  return nodes;
}

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
      part.text = part.text.replace(/^-?\s*/, '');
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

const PARAMETER_NAME_MATCH_RE = /^@param\s([^\s]+)\s/;

export function parseJSDocTags(tags: JSDocTag[]): {
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
    const name = tag.getTagName();
    if (name === 'param') {
      const parameterName = tag.getText().match(PARAMETER_NAME_MATCH_RE)?.[1];
      if (!parameterName) return;
      const docs: ParameterDoc[] = [
        {
          parameterName,
          ...parseJSDocComment(tag.getComment(), true),
        },
      ];
      result.params[parameterName] = docs;
      return;
    }
    result.tags.push({
      name,
      ...parseJSDocComment(tag.getComment()),
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

// export type ParameterDocs = Record<string, MetaDoc>;

// export function extractParameterDocTags(tags: JSDocTag[]): ParameterDocs {
//   const result: ParameterDocs = {};
//   const parsedTags = parseJSDocTags(tags);
//   parsedTags.forEach((tag) => {
//     if (tag.name !== 'param') return;

//     // const parts = tag.getText();
//     // const parameterNamePart = parts.find(
//     //   (part) => part.kind === 'parameterName',
//     // );
//     // if (!parameterNamePart) return;
//     // // const index = parts.indexOf(parameterNamePart);

//     // const parameterName = parameterNamePart.text;
//     // if (!parameterName) return;
//     // const bodyParts: ts.SymbolDisplayPart[] = [];
//     // let hited = false;
//     // parts.forEach(({ text, kind }) => {
//     //   if (!hited) {
//     //     if (['parameterName', 'space'].includes(kind)) {
//     //       return;
//     //     }
//     //     hited = true;
//     //     text = text.replace(/^[\-\s]+/, '');
//     //   }
//     //   bodyParts.push({
//     //     text,
//     //     kind,
//     //   });
//     // });
//     // const doc = toMetaDoc(bodyParts);
//     // result[parameterName] = doc;
//   });
//   return result;
// }

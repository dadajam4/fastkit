const INDENT_MATCH_RE = /^[ \t]*(?=\S)/gm;

export function minIndent(str: string): number {
  const match = str.match(INDENT_MATCH_RE);

  if (!match) {
    return 0;
  }

  return match.reduce((r, a) => Math.min(r, a.length), Infinity);
}

export function stripIndent(str: string): string {
  const indent = minIndent(str);

  if (indent === 0) {
    return str;
  }

  const regex = new RegExp(`^[ \\t]{${indent}}`, 'gm');

  return str.replace(regex, '');
}

const CODE_TRIM_MATCH_RE = /(^\n+|\n\s+$)/g;

export function trimCode(str: string): string {
  return stripIndent(str.replace(CODE_TRIM_MATCH_RE, ''));
}

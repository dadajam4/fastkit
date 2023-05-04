const TOKEN_NAME_MATCH_RE = /^var\((.+)\)$/;

export function extractTokenName(tokenValue: string) {
  const matched = tokenValue.match(TOKEN_NAME_MATCH_RE);
  return matched ? matched[1] : tokenValue;
}

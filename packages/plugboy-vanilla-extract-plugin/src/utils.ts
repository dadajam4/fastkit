const EXTERNAL_DEFAULTS = ['node:*'];

export function mergeExternal(...chunks: (string[] | undefined)[]): string[] {
  const result: string[] = [...EXTERNAL_DEFAULTS];
  for (const chunk of chunks) {
    chunk && result.push(...chunk);
  }
  return Array.from(new Set(result));
}

const wrappedPathRe = /\["?(.*?)"?\]/;

export function objectPathJoin(
  ...paths: Array<string | number | undefined>
): string | undefined {
  let result = '';
  paths.forEach((path) => {
    if (path != null) {
      if (typeof path === 'number' || !wrappedPathRe.test(path)) {
        path = typeof path === 'number' ? `[${path}]` : `["${path}"]`;
      }
      result += path;
    }
  });
  return result.length ? result : undefined;
}

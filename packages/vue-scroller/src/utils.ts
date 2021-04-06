export function warn(message: string) {
  console.warn(`[vue-scroller] ${message}`);
}

export function error(message: string) {
  return new Error(`[vue-scroller] ${message}`);
}

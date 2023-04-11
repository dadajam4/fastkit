export async function getGc() {
  if (typeof global.gc === 'function') return global.gc;
  const { default: v8 } = await import('node:v8');
  const { default: vm } = await import('node:vm');

  v8.setFlagsFromString('--expose_gc');
  return vm.runInNewContext('gc');
}

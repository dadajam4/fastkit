import { extractModule } from '@fastkit/ts-tiny-meta';

export const general = extractModule(import('../src/general'));
export const string = extractModule(import('../src/string'));
export const number = extractModule(import('../src/number'));
export const array = extractModule(import('../src/array'));
export const set = extractModule(import('../src/set'));
export const map = extractModule(import('../src/map'));
export const date = extractModule(import('../src/date'));
export const object = extractModule(import('../src/object'));
export const func = extractModule(import('../src/func'));
export const promise = extractModule(import('../src/promise'));
export const regexp = extractModule(import('../src/regexp'));
export const buffer = extractModule(import('../src/buffer'));
export const delay = extractModule(import('../src/delay'));
export const runtimeFlags = extractModule(import('../src/runtime-flags'));
export const defaults = extractModule(import('../src/defaults'));

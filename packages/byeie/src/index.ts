import { byeie } from './byeie';

try {
  if (__GLOBAL__) {
    byeie();
  }
} catch (err) {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(err);
  }
}

export default byeie;

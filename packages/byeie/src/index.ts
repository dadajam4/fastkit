import { byeie } from './byeie';

try {
  if (__GLOBAL__) {
    byeie();
  }
} catch (err) {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(err);
  }
}

export default byeie;

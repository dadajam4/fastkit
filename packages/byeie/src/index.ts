import { byeie } from './byeie';

try {
  byeie();
} catch (err) {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(err);
  }
}

const STORE_KEY = 'ie_warn_got_it';

export function get() {
  try {
    return sessionStorage.getItem(STORE_KEY) != null;
  } catch (err) {
    return false;
  }
}

export function set() {
  try {
    sessionStorage.setItem(STORE_KEY, '1');
  } catch (err) {
    // noop
  }
}

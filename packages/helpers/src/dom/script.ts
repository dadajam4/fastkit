export interface LoadScriptAttrs {
  crossorigin?: 'anonymous' | 'use-credentials' | '';
  integrity?: string;
  nomodule?: boolean;
  nonce?: string;
  type?: string;
}

export function loadScript(
  src: string,
  attrs?: LoadScriptAttrs | null,
  parentNode?: Node,
): Promise<HTMLScriptElement> {
  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const script = document.createElement('script');

    if (attrs) {
      for (const attr in attrs) {
        script.setAttribute(attr, (attrs as any)[attr]);
      }
    }

    script.onload = () => {
      script.onerror = script.onload = null;
      resolve(script);
    };

    script.onerror = () => {
      script.onerror = script.onload = null;
      reject(new Error(`Failed to load ${src}`));
    };

    script.async = true;
    script.src = src;

    const node =
      parentNode || document.head || document.getElementsByTagName('head')[0];
    node.appendChild(script);
  });
}

const _ensureScriptMap: { [src: string]: Promise<HTMLScriptElement> } = {};

export function ensureScript(src: string): Promise<HTMLScriptElement> {
  if (!_ensureScriptMap[src]) {
    _ensureScriptMap[src] = loadScript(src).catch((err) => {
      delete _ensureScriptMap[src];
      throw err;
    });
  }
  return _ensureScriptMap[src];
}

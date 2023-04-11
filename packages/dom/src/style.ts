import { IN_DOCUMENT } from '@fastkit/helpers';

export function pushDynamicStyle(styleContent: string) {
  if (!IN_DOCUMENT) return;
  const style = document.createElement('style');
  style.innerHTML = styleContent;
  document.head.appendChild(style);
}

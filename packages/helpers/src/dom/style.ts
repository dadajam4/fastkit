import { IN_WINDOW } from './flags';

export function pushDynamicStyle(styleContent: string) {
  if (!IN_WINDOW) return;
  const style = document.createElement('style');
  style.innerHTML = styleContent;
  document.head.appendChild(style);
}

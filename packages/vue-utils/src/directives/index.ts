import { ClickOutsideDirectiveAttrs } from './click-outside';
import { BodyScrollLockDirectiveAttrs } from './body-scroll-lock';
import { ResizeDirectiveAttrs } from './resize';

export * from './utils';
export * from './click-outside';
export * from './body-scroll-lock';
export * from './resize';

interface VueUtilsDirectiveAttrs
  extends ClickOutsideDirectiveAttrs,
    BodyScrollLockDirectiveAttrs,
    ResizeDirectiveAttrs {}

declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HTMLAttributes extends VueUtilsDirectiveAttrs {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AllowedComponentProps extends VueUtilsDirectiveAttrs {}
}

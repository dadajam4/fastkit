import { I18nSpaceDefine } from '@@/i18n';
import { VNodeChild } from 'vue';

export type Translations = {
  // why: {
  //   title: string;
  //   content: () => VNodeChild;
  // };
  // assumedPhilosophy: {
  //   title: string;
  //   content: () => VNodeChild;
  // };
  // flowOfUsage: {
  //   title: string;
  //   example: string;
  // };
  // step1: {
  //   title: string;
  //   content: () => VNodeChild;
  // };
  // step2: {
  //   title: string;
  // };
  // step3: {
  //   title: string;
  // };
};

export const scheme = I18nSpaceDefine.defineScheme({
  translations: (t: Translations) => true,
});

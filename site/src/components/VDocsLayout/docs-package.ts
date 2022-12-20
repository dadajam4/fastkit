import { inject, provide, isRef, computed } from 'vue';
import { DocsLayoutPackageInfo, resolveDocsLayoutPackageInfo } from './schemes';
import { DOCS_PACKAGE_INJECTION_KEY } from './injections';
import { useHead, HeadObject } from '@vueuse/head';
import { useVuePageControl, VuePageControl } from '@fastkit/vot';
import { i18n } from '~/i18n';

export class DocsPackage {
  static use() {
    const pkg = inject(DOCS_PACKAGE_INJECTION_KEY);
    if (!pkg) {
      throw new Error('missing provided DocsPackage');
    }
    return pkg;
  }

  /**
   * Package name (Name in package.json without namespace prefix)
   */
  readonly name: string;

  /**
   * Name for package display
   */
  readonly displayName: string;

  /**
   * Github url
   */
  readonly github: string;

  /**
   * Document Page Home Path
   */
  readonly home: string;

  readonly vpc: VuePageControl;

  get i18n(): ReturnType<typeof i18n.use> {
    return this.vpc.i18n as any;
  }

  constructor(
    pkg?: DocsLayoutPackageInfo | string,
    options?: { home?: string },
  ) {
    const { name, displayName, github, home } = resolveDocsLayoutPackageInfo(
      pkg,
      options,
    );
    this.name = name;
    this.displayName = displayName;
    this.github = github;
    this.home = home;

    this.vpc = useVuePageControl();

    provide(DOCS_PACKAGE_INJECTION_KEY, this);
  }

  useHead(...params: Parameters<typeof useHead>) {
    const obj = params[0];
    const ref = computed<HeadObject>(() => {
      const org = isRef(obj) ? obj.value : obj;
      const chunks: string[] = ['fastkit'];
      const { title } = org;
      if (title) {
        const titleChunk = isRef(title) ? title.value : title;
        if (titleChunk) {
          chunks.unshift(titleChunk);
        }
      }
      return {
        ...org,
        title: chunks.join(' | '),
      };
    });
    useHead(ref);
  }
}

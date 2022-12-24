import { inject, provide, isRef, computed } from 'vue';
import type { PackageInfo } from './schemes';
import { FASTKIT_AUTHOR } from '~~~/core/constants';
import { PACKAGE_PROVIDE_INJECTION_KEY } from './injections';
import { useHead, HeadObject } from '@vueuse/head';
import { useVuePageControl, VuePageControl } from '@fastkit/vot';
import { i18n } from '~/i18n';

export class PackageProvide {
  static use() {
    const pkg = inject(PACKAGE_PROVIDE_INJECTION_KEY);
    if (!pkg) {
      throw new Error('missing provided package');
    }
    return pkg;
  }

  /**
   * Package Information
   */
  readonly info: PackageInfo;

  readonly vpc: VuePageControl;

  /** Name for package display */
  readonly displayName: string;

  /** Github url */
  readonly github: string;

  /** Document Page Home Path */
  readonly home: string;

  get i18n(): ReturnType<typeof i18n.use> {
    return this.vpc.i18n as any;
  }

  /** Package name (Name in package.json without namespace prefix) */
  get name() {
    return this.info.name;
  }

  /** Package Overview */
  get description() {
    const { baseLocale, currentLocaleName } = this.i18n;
    const { description } = this.info;
    return description[currentLocaleName] || description[baseLocale] || '';
  }

  /** list of dependent packages for development */
  get devDependencies() {
    return this.info.devDependencies;
  }

  get dependencies() {
    return this.info.dependencies;
  }

  get peerDependencies() {
    return this.info.peerDependencies;
  }

  constructor(
    info: PackageInfo,
    options: {
      /**
       * Document Page Home Path
       */
      home?: string;
      /**
       * Name for package display
       */
      displayName?: string;
    } = {},
  ) {
    this.vpc = useVuePageControl();
    this.info = info;

    const displayName = options.displayName || this.name;
    const { home = `/${this.name}` } = options;
    const githubBase = `https://github.com/${FASTKIT_AUTHOR}/fastkit`;
    const github = `${githubBase}${
      this.name === 'fastkit' ? '' : `/tree/main/packages/${this.name}#readme`
    }`;

    this.displayName = displayName;
    this.github = github;
    this.home = home;
  }

  provide() {
    provide(PACKAGE_PROVIDE_INJECTION_KEY, this);
    return this;
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

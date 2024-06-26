import { inject, provide, isRef, computed } from 'vue';
import { useHead, UseHeadInput, ReactiveHead } from '@unhead/vue';
import { useVuePageControl, VuePageControl } from '@fastkit/vot';
import { arrayUnique } from '@fastkit/helpers';
import { VHero } from '@fastkit/vui';
import { PMScript } from '@@/pm-script';
import type { PackageInfo } from './schemes';
// eslint-disable-next-line import/no-relative-packages
import fastkitPackageJson from '../../../../package.json';
import { PACKAGE_PROVIDE_INJECTION_KEY } from './injections';
import { i18n } from '../i18n';
import { VDocsSection } from '~/components';

const FASTKIT_AUTHOR = fastkitPackageJson.author;

const extractTitleFromHeadObject = (
  input?: UseHeadInput,
): {
  title?: string;
  obj: ReactiveHead;
} => {
  if (!input) return { obj: {} };
  const value = isRef(input) ? input.value : input;
  const obj = typeof value === 'function' ? value() : value;
  const { title: _title } = obj;
  const title = _title && isRef(_title) ? _title.value : _title;
  return {
    title: typeof title === 'string' ? title : undefined,
    obj,
  };
};

export class PackageProvide {
  static use<AllowMissing extends boolean = false>(
    allowMissing?: AllowMissing,
  ): AllowMissing extends true ? PackageProvide | undefined : PackageProvide {
    const pkg = inject(PACKAGE_PROVIDE_INJECTION_KEY, undefined);
    if (!pkg && !allowMissing) {
      throw new Error('missing provided package');
    }
    return pkg as PackageProvide;
  }

  static useHead(input?: UseHeadInput, titleAppends?: string) {
    const ref = computed<ReactiveHead>(() => {
      const { title, obj } = extractTitleFromHeadObject(input);
      const titleChunks: string[] = ['fastkit'];
      titleAppends && titleChunks.unshift(titleAppends);
      title && titleChunks.unshift(title);
      return {
        ...obj,
        title: arrayUnique(titleChunks).join(' | '),
      };
    });
    useHead(ref);
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

  readonly pm: PMScript;

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
    this.pm = PMScript.use();
  }

  provide() {
    provide(PACKAGE_PROVIDE_INJECTION_KEY, this);
    return this;
  }

  useHead(input?: UseHeadInput) {
    return PackageProvide.useHead(input, this.displayName);
  }

  renderInstallation() {
    return (
      <VDocsSection title={this.i18n.at.common.t.installation}>
        {this.pm.renderInstallCommand(this.info.fullName)}
      </VDocsSection>
    );
  }

  renderHeader() {
    return (
      <div class="package-provide-header">
        <VHero>{this.displayName}</VHero>
        <p class="docs-container mt-4">{this.description}</p>

        {this.renderInstallation()}
      </div>
    );
  }
}

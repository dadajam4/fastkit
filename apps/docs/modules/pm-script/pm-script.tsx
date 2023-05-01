import { Ref, ref, inject } from 'vue';
import { PackageManagerName } from './schemes';
import { Cookies } from '@fastkit/cookies';
import {
  PACKAGE_MANAGER_NAMES,
  COOKIE_STORE_KEY,
  COOKIE_MAX_AGE,
  DEFAULT_PM,
} from './constants';
import { VuePageControl } from '@fastkit/vot';
import { PM_SCRIPT_INJECTION_KEY } from './injections';
import { VTabs, VTabsItem } from '@fastkit/vui';
import { VCode } from '~/components';

function isPackageManagerName(source: any): source is PackageManagerName {
  return PACKAGE_MANAGER_NAMES.includes(source);
}

const INSTALL_COMMAND_MAP: Record<PackageManagerName, string> = {
  npm: 'install',
  yarn: 'add',
  pnpm: 'add',
};

const tabsItems: VTabsItem[] = PACKAGE_MANAGER_NAMES.map((name) => {
  return {
    label: () => <span class="notranslate">{name}</span>,
    value: name,
  };
});

export class PMScript {
  static use(): PMScript {
    const pmScript = inject(PM_SCRIPT_INJECTION_KEY);
    if (!pmScript) {
      throw new Error('missing provided PMScript');
    }
    return pmScript;
  }

  readonly ctx: VuePageControl;
  private _selected: Ref<PackageManagerName> = ref(DEFAULT_PM);
  private _cookies?: Cookies;

  get selected(): PackageManagerName {
    return this._selected.value;
  }

  set selected(selected) {
    if (this.selected === selected) return;
    this._selected.value = selected;
    this._setCookie(selected);
  }

  constructor(ctx: VuePageControl) {
    this.ctx = ctx;
    this._restoreCookie = this._restoreCookie.bind(this);
    if (!import.meta.env.SSR) {
      this._cookies = new Cookies(document);
    }
  }

  getInstallCommand(packages: string | string[], dev?: boolean) {
    const _packages = Array.isArray(packages) ? packages.join(' ') : packages;
    const { selected } = this;
    const command = INSTALL_COMMAND_MAP[selected];
    const devSuffix = dev ? ' -D' : '';
    return `${selected} ${command} ${_packages}${devSuffix}`;
  }

  tabSwitcher() {
    return (
      <VTabs
        items={tabsItems}
        v-model={this.selected}
        onVnodeMounted={this._restoreCookie}
      />
    );
  }

  renderInstallCommand(packages: string | string[], dev?: boolean) {
    return (
      <div>
        {this.tabSwitcher()}
        <VCode code={this.getInstallCommand(packages, dev)} language="sh" />
      </div>
    );
  }

  private _setCookie(selected: PackageManagerName): void {
    this._cookies?.set(COOKIE_STORE_KEY, selected, { maxAge: COOKIE_MAX_AGE });
  }

  private _getCookie(): PackageManagerName | undefined {
    const cookieValue = this._cookies?.get(COOKIE_STORE_KEY);
    if (isPackageManagerName(cookieValue)) {
      return cookieValue;
    }
  }

  private _restoreCookie() {
    const cookieValue = this._getCookie();
    if (cookieValue && this._selected.value !== cookieValue) {
      this._selected.value = cookieValue;
    }
  }
}

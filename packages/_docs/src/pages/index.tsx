import { ref } from 'vue';

import {
  VButton,
  VDialog,
  VSnackbar,
  VMenu,
  useVueStack,
  useColorScheme,
  VExpandTransition,
  useMediaMatch,
} from '@fastkit/vui';
import { getLogger } from '../logger';
import { AppError } from '../error';

const logger = getLogger('HomeView');

export default defineNuxtComponent({
  // scrollBehavior: () => {
  //   return Promise.resolve({ top: 0 });
  //   // return Promise.resolve(false);
  // },
  async setup() {
    const vueStack = useVueStack();
    const colorScheme = useColorScheme();
    const mm = useMediaMatch();

    logger.info('home view is setuped.');

    const { data } = await useAsyncData(
      'home',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true };
      },
      { defer: false },
    );

    return {
      data,
      vueStack,
      colorScheme,
      disabled: ref(false),
      count: ref(0),
      stackActive: ref(false),
      persistent: ref(false),
      expanded: ref(false),
      hoge: ref(0),
      mm,
    };
  },
  render() {
    return (
      <div style={{ padding: '20px' }}>
        <h1>
          決済設定<>{JSON.stringify(this.data)}</>
        </h1>
        <p>
          Typographyヘルパークラスを使用してテキストのサイズとスタイルを制御します。
          これらの値は、 Material Design type specification に基づいています。
        </p>

        <h2>これはheading2です</h2>
        <h3>これはheading3です</h3>
        <h4>これはheading4です</h4>
        <h5>これはheading5です</h5>
        <h6>これはheading6です</h6>

        {/* <Teleport to={this.ctrl.hoge.value}>あいう</Teleport> */}

        <p>
          Typographyヘルパークラスを使用してテキストのサイズとスタイルを制御します。
          これらの値は、 Material Design type specification に基づいています。
        </p>

        <h2>基本設定</h2>

        {/* {this.mm.matches('wide') ? 'wide' : 'narrow'} */}

        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/page2">page2</NuxtLink>

        <hr />
        <VButton
          onClick={(ev) => {
            logger.info('clickしたー', ev);
          }}>
          INFOログ
        </VButton>

        <VButton
          onClick={() => {
            try {
              (window as any).hogehoge();
            } catch (_err) {
              const err = new AppError(_err);
              logger.error(err.toJSON());
              throw err;
            }
          }}>
          エラーをスローする
        </VButton>

        <VButton
          onClick={(ev) => {
            logger.trace('clicked!!!', ev);
            this.vueStack.alert({
              content: (ctrl) => {
                return 'message';
              },
            });
          }}>
          click!
        </VButton>

        <VSnackbar
          top
          v-slots={{
            activator: ({ attrs }) => {
              return [<VButton {...attrs}>hoge</VButton>];
            },
          }}>
          あいうえお
        </VSnackbar>

        <VMenu
          v-slots={{
            activator: ({ attrs }) => {
              return [<VButton {...attrs}>メニューを開く</VButton>];
            },
          }}>
          これはメニューです
          <VButton
            onClick={(e) => {
              this.expanded = !this.expanded;
            }}>
            click!!
          </VButton>
          <VExpandTransition
            onAfterEnter={(e) => {
              console.log(e);
            }}>
            <div v-show={this.expanded} style={{ transition: 'all 0.35s' }}>
              <p>
                中身です。 中身です。 中身です。 中身です。 中身です。
                中身です。
              </p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
              <p>中身です。 中身です。</p>
            </div>
          </VExpandTransition>
        </VMenu>
        <select v-model={this.colorScheme.rootTheme}>
          {this.colorScheme.themeNames.map((t) => {
            return (
              <option value={t} key={t}>
                {t}
              </option>
            );
          })}
        </select>

        <button
          type="button"
          onClick={(e) => {
            this.count++;
          }}>
          {`Click!! ${this.count}`}
        </button>
        <p>{JSON.stringify(this.stackActive)}</p>
        <div>
          <label>
            <input type="checkbox" v-model={this.persistent} />
            persistent
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" v-model={this.stackActive} />
            {`モデル${this.stackActive ? 'ON' : 'OFF'}`}
          </label>
        </div>
        <VDialog
          backdrop
          persistent={this.persistent}
          class={`my-stack--${this.count}`}
          v-model={this.stackActive}
          actions={[
            {
              key: 'cancel',
              content: 'キャンセル',
              color: 'primary',
              variant: 'outlined',
              spacer: true,
              onClick: (control) => {
                control.close({ force: true });
              },
            },
            {
              key: 'ok',
              content: 'OK',
              color: 'primary',
              // spacer: true,
              onClick: (control) => {
                control.close({ force: true });
              },
            },
          ]}
          v-slots={{
            activator: ({ attrs, control }) => {
              return [
                <VButton {...attrs} color="primary">
                  {`アクティベーター${control.isActive ? 'ON' : 'OFF'}`}
                </VButton>,
              ];
            },
          }}>
          あいうえお
        </VDialog>
        <div class="primary fill">primary Scope</div>
        <div class="error outline">primary Scope</div>

        <label>
          <input type="checkbox" v-model={this.disabled} />
          Disabled
        </label>

        {/* {colorScheme.variants.map((variant) => (
          <div key={variant}>
            <h3>{variant}</h3>
            {scopeNames.map((scopeName) => {
              return (
                <VButton
                  color={scopeName}
                  key={scopeName}
                  disabled={this.disabled}
                  variant={variant}>
                  ボタン({scopeName || '*default'})
                </VButton>
              );
            })}
          </div>
        ))} */}
      </div>
    );
  },
});

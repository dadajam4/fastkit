import './Home.scss';
import { defineComponent, ref } from 'vue';
import {
  VButton,
  VDialog,
  VSnackbar,
  VMenu,
  useVueStack,
  useColorScheme,
  VExpandTransition,
} from '@fastkit/vui';
import { RouterLink } from 'vue-router';
import { mediaQueryService } from '../plugins/media-query';
import { colorScheme } from '../../.dynamic/color-scheme/color-scheme.info';
import { getLogger } from '../logger';
// import axios from 'axios';
import { AppError } from '../error';
// import { VAppLayoutControl, VAppBar } from '@fastkit/vue-app-layout';

const logger = getLogger('HomeView');

const component = defineComponent({
  name: 'HomeView',
  setup() {
    const vueStack = useVueStack();
    const colorScheme = useColorScheme();

    // VAppLayoutControl.appendTo('header', () => {
    //   return <span>あああ</span>;
    // });

    logger.info('home view is setuped.');

    // const ctrl = VAppLayoutControl.use();
    // console.log('●', ctrl.hoge);

    return {
      vueStack,
      colorScheme,
      disabled: ref(false),
      count: ref(0),
      stackActive: ref(false),
      persistent: ref(false),
      expanded: ref(false),
      hoge: ref(0),
      // ctrl,
    };
  },
  render() {
    const { scopeNames } = this.colorScheme;
    return (
      <div style={{ padding: '20px' }}>
        <h1>決済設定</h1>
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

        {mediaQueryService.matches('wide') ? 'wide' : 'narrow'}

        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/page2">page2</RouterLink>

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
          Click!! {this.count}
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
            モデル{this.stackActive ? 'ON' : 'OFF'}
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
                  アクティベーター{control.isActive ? 'ON' : 'OFF'}
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

        {colorScheme.variants.map((variant) => (
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
        ))}
      </div>
    );
  },
});

export default component;

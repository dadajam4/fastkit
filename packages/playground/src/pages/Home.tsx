import './Home.scss';
import { defineComponent, ref, getCurrentInstance } from 'vue';
import {
  VStackBtn,
  VStackDialog,
  VStackSnackbar,
  VStackMenu,
  useVueStack,
} from '@fastkit/vue-stack';
import { RouterLink } from 'vue-router';
import { useColorScheme } from '@fastkit/vue-color-scheme';
import { VExpandTransition } from '@fastkit/vue-utils';
import { mediaQueryService } from '../plugins/media-query';
import { colorScheme } from '../../.dynamic/color-scheme/color-scheme.info';
import { getLogger } from '../logger';
// import axios from 'axios';
import { AppError } from '../error';

const logger = getLogger('HomeView');

const component = defineComponent({
  name: 'HomeView',
  setup() {
    const vueStack = useVueStack();
    const colorScheme = useColorScheme();

    logger.info('home view is setuped.');

    return {
      vueStack,
      colorScheme,
      disabled: ref(false),
      count: ref(0),
      stackActive: ref(false),
      persistent: ref(false),
      expanded: ref(false),
    };
  },
  render() {
    const { scopeNames } = this.colorScheme;
    return (
      <div style={{ padding: '20px' }}>
        <h2>Home</h2>
        {mediaQueryService.matches('wide') ? 'wide' : 'narrow'}

        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/page2">page2</RouterLink>

        <hr />
        <VStackBtn
          onClick={(ev) => {
            logger.info('clickしたー', ev);
          }}>
          INFOログ
        </VStackBtn>

        <VStackBtn
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
        </VStackBtn>

        <VStackBtn
          onClick={(ev) => {
            logger.trace('clicked!!!', ev);
            this.vueStack.alert({
              content: (ctrl) => {
                return 'message';
              },
            });
          }}>
          click!
        </VStackBtn>

        <VStackSnackbar
          top
          v-slots={{
            activator: ({ attrs }) => {
              return [<VStackBtn {...attrs}>hoge</VStackBtn>];
            },
          }}>
          あいうえお
        </VStackSnackbar>

        <h1>App</h1>

        <VStackMenu
          v-slots={{
            activator: ({ attrs }) => {
              return [<VStackBtn {...attrs}>メニューを開く</VStackBtn>];
            },
          }}>
          これはメニューです
          <VStackBtn
            onClick={(e) => {
              this.expanded = !this.expanded;
            }}>
            click!!
          </VStackBtn>
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
        </VStackMenu>
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
        <VStackDialog
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
                <VStackBtn {...attrs} color="primary">
                  アクティベーター{control.isActive ? 'ON' : 'OFF'}
                </VStackBtn>,
              ];
            },
          }}>
          あいうえお
        </VStackDialog>
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
                <VStackBtn
                  color={scopeName}
                  key={scopeName}
                  disabled={this.disabled}
                  variant={variant}>
                  ボタン({scopeName || '*default'})
                </VStackBtn>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
});

export default component;

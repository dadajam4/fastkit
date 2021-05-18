import './Home.scss';
import { defineComponent, ref } from 'vue';
import { VStackBtn, VStackDialog } from '@fastkit/vue-stack';
import { RouterLink } from 'vue-router';

const component = defineComponent({
  name: 'Page2View',
  setup() {
    return {
      disabled: ref(false),
      count: ref(0),
      stackActive: ref(false),
      persistent: ref(false),
    };
  },
  render() {
    const { scopeNames } = this.$color;
    return (
      <div style={{ padding: '20px' }}>
        <h2>Home</h2>

        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/page2">page2</RouterLink>

        <h1>Page2View</h1>
        <select v-model={this.$color.rootTheme}>
          {this.$color.themeNames.map((t) => {
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
          color="primary"
          contained
          class={`my-stack--${this.count}`}
          v-model={this.stackActive}
          actions={[
            {
              key: 'cancel',
              content: 'キャンセル',
              color: 'primary',
              outlined: true,
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
        <h3>contained</h3>
        {scopeNames.map((scopeName) => {
          return (
            <VStackBtn
              color={scopeName}
              key={scopeName}
              disabled={this.disabled}>
              ボタン({scopeName || '*default'})
            </VStackBtn>
          );
        })}
        <h3>outlined</h3>
        {scopeNames.map((scopeName) => {
          return (
            <VStackBtn
              color={scopeName}
              key={scopeName}
              disabled={this.disabled}
              outlined>
              ボタン({scopeName || '*default'})
            </VStackBtn>
          );
        })}
        <h3>plain</h3>
        {scopeNames.map((scopeName) => {
          return (
            <VStackBtn
              color={scopeName}
              key={scopeName}
              disabled={this.disabled}
              plain>
              ボタン({scopeName || '*default'})
            </VStackBtn>
          );
        })}
      </div>
    );
  },
});

export default component;

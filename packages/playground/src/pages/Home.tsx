import './Home.scss';
import { defineComponent, ref } from 'vue';
import { VStackBtn } from '@fastkit/vue-stack';

const component = defineComponent({
  name: 'HomeView',
  setup() {
    return {
      disabled: ref(false),
    };
  },
  render() {
    const { scopeNames } = this.$color;
    return (
      <>
        <h2>Home</h2>
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
      </>
    );
  },
});

export default component;

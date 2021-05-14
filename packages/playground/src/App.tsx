import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { useInjectTheme } from '@fastkit/vue-color-scheme';

export const App = defineComponent({
  name: 'App',
  setup() {
    useInjectTheme();
  },
  render() {
    return (
      <div>
        <h1>App</h1>
        <select v-model={this.$color.rootTheme}>
          {this.$color.themeNames.map((t) => {
            return (
              <option value={t} key={t}>
                {t}
              </option>
            );
          })}
        </select>
        <RouterView></RouterView>
      </div>
    );
  },
});

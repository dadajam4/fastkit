import { defineComponent, ref } from 'vue';
import {
  VHero,
  VTabs,
  useVui,
  ScopeName,
  VSelect,
  VTabsItem,
  VContentSwitcher,
} from '@fastkit/vui';
import { DocsSection } from '../../../../-components';
import { range, objectFromArray } from '@fastkit/helpers';
import { VPage } from '@fastkit/vue-page';
import { MOCK_ITEMS_1 } from './-tabs';

export default defineComponent({
  setup() {
    const vui = useVui();
    const tab1 = ref('');
    const tab2 = ref('');
    const tab3 = ref('');
    const color = ref<ScopeName | undefined>();

    const colors = vui.options.colorScheme.scopeNames;

    const mockItems1 = MOCK_ITEMS_1.slice();

    const createSlots = (items: VTabsItem[]) => {
      return objectFromArray(items, (row, index) => {
        const { value } = row;
        let _range = parseInt(value, 10);
        if (isNaN(_range)) _range = index;
        return [
          value,
          () => {
            return range(_range, 1).map((n) => {
              return <div>{`コンテンツ${value} - 行 ${n}`}</div>;
            });
          },
        ];
      });
    };

    return {
      createSlots,
      vui,
      tab1,
      tab2,
      tab3,
      mockItems1,
      colors,
      color,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Tabs</VHero>
        <DocsSection title="Basic">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VTabs
                color={this.color}
                items={this.mockItems1}
                v-model={this.tab1}
              />
              <VContentSwitcher
                v-model={this.tab1}
                order={this.mockItems1}
                v-slots={this.createSlots(this.mockItems1)}
              />
              {/* <p>
                <code>{this.tab1}</code>
                を選択しています。
              </p> */}
            </div>
            <div class="pg-columns__sub">
              <VSelect
                label="color"
                size="sm"
                v-model={this.color}
                items={this.colors.map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </div>
          </div>
        </DocsSection>

        <DocsSection title="Routable">
          <VTabs
            items={this.mockItems1}
            v-model={this.tab2}
            withQuery
            router={(value) => {
              return {
                path: this.$route.path,
                query: {
                  ...this.$route.query,
                  tab2: value,
                },
              };
            }}
          />
          <VContentSwitcher
            v-model={this.tab2}
            order={this.mockItems1}
            v-slots={this.createSlots(this.mockItems1)}
          />
        </DocsSection>

        <DocsSection title="Routable with nested routes(Use router-view sample)">
          <VTabs
            items={this.mockItems1}
            v-model={this.tab3}
            router={(value) => {
              return {
                path: `/vui/components/tabs/${value}`,
                query: {
                  ...this.vui.location.currentRoute.query,
                },
              };
            }}
          />
          <VPage />
        </DocsSection>
      </div>
    );
  },
});

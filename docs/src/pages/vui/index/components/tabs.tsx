import { defineComponent, ref } from 'vue';
import {
  VHero,
  VTabs,
  useVui,
  ScopeName,
  VSelect,
  VTabsItem,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';
import { range, objectFromArray } from '@fastkit/helpers';

export default defineComponent({
  setup() {
    const vui = useVui();
    const tab1 = ref('');
    const color = ref<ScopeName | undefined>();

    const colors = vui.options.colorScheme.scopeNames;

    const mockItems1 = [
      {
        value: 'home',
        label: 'Home',
      },
      {
        value: 'about',
        label: 'About',
      },
      {
        value: 'task',
        label: 'Task',
      },
      {
        value: 'settings',
        label: 'Settings',
      },
      ...range(5, 1).map((i) => ({
        value: `item${i}`,
        label: `item${i}`,
      })),
    ];

    const createSlots = (items: VTabsItem[]) => {
      return objectFromArray(items, (row, index) => {
        const { value } = row;
        let _range = parseInt(value, 10);
        if (isNaN(_range)) _range = index;
        return [
          value,
          () => {
            return range(_range, 1).map((n) => {
              return (
                <div>
                  コンテンツ{value} - 行 {n}
                </div>
              );
            });
          },
        ];
      });
    };

    return {
      tab1,
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
              <p>
                <code>{this.tab1}</code>
                を選択しています。
              </p>
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
      </div>
    );
  },
});

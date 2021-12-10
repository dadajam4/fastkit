import { defineComponent } from 'vue';
import { VHero, VDataTable, DataTableHeader, useVueStack } from '@fastkit/vui';
// import { DocsSection } from '../../../-components';
import { range } from '@fastkit/helpers';
import { createPrefetch } from '@fastkit/vue-page';

const prefetch = createPrefetch(
  'vui-data-table-prefetch',
  async ({ getQuery }) => {
    const total = 236;
    const limit = getQuery('limit', Number, 20);
    const page = getQuery('page', Number, 1);
    const offset = (page - 1) * limit;
    const less = total - offset;
    const count = less < 1 ? 0 : Math.min(limit, less);

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const items = range(count, offset + 1).map((i) => {
      return {
        id: String(i),
        name: `項目${i}`,
        test: 'これはデータです',
        column1: 'This is Nagai text. This is Nagai text.',
        column2: 'This is Nagai text. This is Nagai text.',
        column3: 'This is Nagai text. This is Nagai text.',
        column4: 'This is Nagai text. This is Nagai text.',
        column5: 'This is Nagai text. This is Nagai text.',
      };
    });

    return {
      page,
      limit,
      items,
      total,
    };
  },
);

export default defineComponent({
  prefetch,
  setup() {
    const result = prefetch.inject();
    const stack = useVueStack();
    const headers: DataTableHeader[] = [
      {
        key: 'id',
        label: 'ID',
        cell: (payload) => payload.item.id,
        sortQuery: 'id',
      },
      {
        key: 'name',
        label: '名前',
        cell: (payload) => payload.item.name,
      },
      {
        key: 'test',
        label: 'テスト',
        cell: (payload) => payload.item.test,
      },
      {
        key: 'column1',
        label: 'Column1',
        cell: (payload) => payload.item.column1,
      },
      {
        key: 'column2',
        label: 'Column2',
        cell: (payload) => payload.item.column2,
      },
      {
        key: 'column3',
        label: 'Column3',
        cell: (payload) => payload.item.column3,
      },
      {
        key: 'column4',
        label: 'Column4',
        cell: (payload) => payload.item.column4,
      },
      {
        key: 'column5',
        label: 'Column5',
        cell: (payload) => payload.item.column5,
      },
    ];

    return {
      // page1,
      stack,
      result,
      headers,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Data tables</VHero>

        {/* <DocsSection title="Basic">
          <VDataTable
            headers={this.headers}
            items={this.result.items}
            total={this.result.total}
            fixedHeader
          />
        </DocsSection> */}

        <h2>Basic</h2>
        <VDataTable
          headers={this.headers}
          items={this.result.items}
          total={this.result.total}
          fixedHeader
        />
      </div>
    );
  },
});

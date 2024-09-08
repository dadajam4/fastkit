import { defineComponent, ref } from 'vue';
// import {
//   VAppSystemBar,
//   VAppToolbar,
//   VAppDrawer,
//   VAppContainer,
//   VueAppLayoutPositionX,
// } from '@fastkit/vue-app-layout';
import { range } from '@fastkit/helpers';
import { Sortable } from '@fastkit/vue-sortable';
import * as Styles from './index.css';
// import { VHero, VButton, VDialog, VBreadcrumbs } from '@fastkit/vui';
// import { range } from '@fastkit/helpers';
// import * as styles from './index.css';

interface Item {
  value: string;
  label: string;
}

export default defineComponent({
  setup() {
    const items1 = ref<Item[]>(
      range(5).map((value) => ({
        value: String(value),
        label: `項目${value}`,
      })),
    );

    const items2 = ref<Item[]>(
      range(5, 5).map((value) => ({
        value: String(value),
        label: `項目${value}`,
      })),
    );

    const add = () => {
      items2.value.push({
        value: '100',
        label: '100',
      });
    };

    return () => (
      <div>
        <button type="button" onClick={add}>
          ADD
        </button>
        <div class={Styles.columns}>
          <div class={Styles.column}>
            <table>
              <Sortable
                class="id-1"
                group="hoge"
                handle=".handle"
                v-model={items1.value}
                animation={150}
                multiDrag
                multiDragKey="SHIFT"
                selectedClass={Styles.itemSelected}
                v-slots={{
                  wrapper: (ctx) => (
                    <tbody {...ctx.attrs} class={Styles.list}>
                      {ctx.children}
                    </tbody>
                  ),
                  item: (ctx) => (
                    <tr {...ctx.attrs} class={Styles.item}>
                      <td>
                        <div
                          class="handle"
                          style={{
                            width: '12px',
                            height: '12px',
                            cursor: 'grab',
                            background: 'currentColor',
                          }}></div>
                      </td>
                      <td>{ctx.data.label}</td>
                      <td>{String(ctx.sortable.guardInProgress)}</td>
                    </tr>
                  ),
                }}
              />
            </table>

            {/* <Sortable
              class="id-1"
              group="hoge"
              v-model={items1.value}
              animation={150}
              multiDrag
              multiDragKey="SHIFT"
              selectedClass={Styles.itemSelected}
              v-slots={{
                wrapper: (ctx) => (
                  <div {...ctx.attrs} class={Styles.list}>
                    {ctx.children}
                  </div>
                ),
                item: (ctx) => (
                  <div {...ctx.attrs} class={Styles.item}>
                    <div>{ctx.data.label}</div>
                    <span>{String(ctx.sortable.guardInProgress)}</span>
                  </div>
                ),
              }}
            /> */}
            {JSON.stringify(items1.value)}
          </div>
          <div class={Styles.column}>
            <Sortable
              class="id-2"
              group="hoge"
              v-model={items2.value}
              animation={150}
              multiDrag
              beforeUpdate={async (ctx) => {
                // console.log(ctx.entries);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return false;
              }}
              multiDragKey="SHIFT"
              selectedClass={Styles.itemSelected}
              v-slots={{
                wrapper: (ctx) => (
                  <div {...ctx.attrs} class={Styles.list}>
                    {ctx.children}
                  </div>
                ),
                item: (ctx) => (
                  <div {...ctx.attrs} class={Styles.item}>
                    <div>{ctx.data.label}</div>
                    <span>{String(ctx.sortable.guardInProgress)}</span>
                  </div>
                ),
              }}
            />
            {JSON.stringify(items2.value)}
          </div>
        </div>
      </div>
    );
  },
});

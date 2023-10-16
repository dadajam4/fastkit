import { defineComponent } from 'vue';
import { VButton, useVui } from '@fastkit/vui';

export default defineComponent({
  setup() {
    const vui = useVui();

    const handleClick = (ev: MouseEvent) => {
      vui.snackbar('Clicked !!!');
    };

    return () => {
      return (
        <div>
          <h1>テストトップ</h1>
          <VButton>ノーマル</VButton>
          <VButton href="https://google.com">通常リンク</VButton>
          <VButton href="https://google.com" target="_blank">
            外部リンク
          </VButton>
          <VButton to="./fuga">相対リンク（下）</VButton>
          {/* <VButton
            to="/"
            guard={(ev) => {
              return false;
            }}>
            SPA TOP遷移
          </VButton> */}
          <VButton onClick={handleClick}>クリック処理</VButton>
        </div>
      );
    };
  },
});

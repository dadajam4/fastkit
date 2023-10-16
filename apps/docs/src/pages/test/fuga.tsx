import { defineComponent } from 'vue';
import { VButton, useVui } from '@fastkit/vui';

export default defineComponent({
  setup() {
    const vui = useVui();

    const confirmGuard = (ev: MouseEvent) => {
      return vui.confirm('OKですか？').then((result) => result === true);
    };

    const handleClick = (ev: MouseEvent) => {
      vui.snackbar('Clicked !!!');
    };

    return () => {
      return (
        <div>
          <h1>テスト下層</h1>
          <VButton>ノーマル</VButton>
          <VButton href="https://google.com" guard={confirmGuard}>
            通常リンク＆（確認ダイアログ）
          </VButton>
          <VButton
            href="https://google.com"
            guard={confirmGuard}
            target="_blank">
            外部リンク＆（確認ダイアログ）
          </VButton>
          <VButton to="../" guard={confirmGuard}>
            相対リンク（上）＆（確認ダイアログ）
          </VButton>
          <VButton to="../piyo/">相対リンク（同じ階層）</VButton>
          <VButton to="/" guard={confirmGuard}>
            SPA TOP遷移＆（確認ダイアログ）
          </VButton>
          <VButton onClick={handleClick} guard={confirmGuard}>
            クリック処理
          </VButton>
        </div>
      );
    };
  },
});

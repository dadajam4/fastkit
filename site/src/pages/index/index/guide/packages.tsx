import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, DocsPackage } from '~/components';
import { i18n } from '~/i18n';

export default defineComponent({
  setup() {
    const pkg = DocsPackage.use();
    const { trans } = i18n.use().at.common;

    pkg.useHead({
      title: trans.packages,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.packages}</VHero>

          <VDocsSection title="パッケージ構成">
            <p>
              私は、規模の大小を問わず様々なアプリケーションを開発しているデベロッパーです。そしてそのほとんどの開発にJavaScriptを利用しています。
              <br />
              私は常に、アプリケーションの規模やプロジェクトの予算の大小を問わず、どのアプリケーションに対しても等しく、最大のパフォーマンスを投入したいと願っています。
              <br />
              fastkitはこの願いを叶えるために育て始めたツールキット集です。
            </p>

            <p>
              職人が新しい制作を行う時、それまでの制作の中で磨き続けてきたツールを放棄してゼロからのスタートを望むでしょうか？
              <br />
              fastkitは私の現場のニーズを常に反映しつつ、今の開発、そして明日の開発を柔軟にスピーディーに支えるためのツールキットであり続けることを目指しています。
            </p>
          </VDocsSection>
        </div>
      );
    };
  },
});

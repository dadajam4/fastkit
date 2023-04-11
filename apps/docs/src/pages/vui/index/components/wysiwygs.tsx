import './wysiwygs.scss';
import { defineComponent, ref } from 'vue';
import {
  VHero,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  CONTROL_FIELD_VARIANTS,
  ControlFieldVariant,
  VSelect,
} from '@fastkit/vui';
import {
  VWysiwygEditor,
  createWysiwygColorTool,
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
  WysiwygLinter,
  WysiwygLinterBadWords,
} from '@fastkit/vui-wysiwyg';
import { DocsSection } from '../../../-components';

const extensions = [
  WysiwygLinter.configure({
    plugins: [WysiwygLinterBadWords(['abc', 'evidently'])],
  }),
];

const tools = [
  createWysiwygColorTool({
    withLabel: true,
    items: [
      {
        name: 'リセット',
        color: null,
      },
      {
        name: '強調色',
        color: 'var(--palette-error)',
      },
    ],
  }),
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
];
export default defineComponent({
  setup() {
    const text1 = ref(`
    <h2>
      Hi there,
    </h2>
    <p>
      this is a evidently basic <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
    </p>
    <ul>
      <li>
        That’s a bullet list with one …
      </li>
      <li>
        … or two list items.
      </li>
    </ul>
    <p>
      Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
    </p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
    <p>
      I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
    </p>
    <blockquote>
      Wow, that’s amazing. Good work, boy! 👏
      <br />
      — Mom
    </blockquote>
    `);

    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const floating = ref(false);
    const disabledMinHeight = ref(false);
    const disabledMaxHeight = ref(false);

    return {
      text1,
      size,
      variant,
      disabled,
      readonly,
      floating,
      disabledMinHeight,
      disabledMaxHeight,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-wysiwygs">
        <VHero>Wysiwygs</VHero>
        <DocsSection title="Basic">
          <button
            type="button"
            onClick={(ev) => {
              this.text1 = 'あああ';
            }}>
            xxxxx
          </button>

          <button
            type="button"
            onClick={(ev) => {
              console.log(ev.pageY);
              this.$vui.menu({
                content: 'xxx',
              });
            }}>
            menu
          </button>
          <VWysiwygEditor
            label="日本語"
            extensions={extensions}
            tools={tools}
            v-model={this.text1}
            counter={100}
            // maxlength="100"
            variant="filled"
            // finishings={async (value) => {
            //   if (!(await this.$vui.confirm('Ary you realy ?'))) {
            //     return value || '';
            //   }
            //   return 'Hello !! ' + value;
            // }}
          />

          <div
            class="wysiwyg"
            style={{ maxHeight: '200px', overflow: 'auto' }}
            v-html={this.text1}
          />
        </DocsSection>

        <DocsSection title="Floating toolbar">
          <VWysiwygEditor
            label="日本語"
            extensions={extensions}
            tools={tools}
            v-model={this.text1}
            counter={100}
            // maxlength="100"
            variant="filled"
            floatingToolbar
          />
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              {CONTROL_FIELD_VARIANTS.map((variant) => (
                <VWysiwygEditor
                  label={variant}
                  extensions={extensions}
                  tools={tools}
                  required
                  placeholder="プレースホルダー"
                  hint="これは入力ヒントテキストです。"
                  counter
                  maxlength="100"
                  size={this.size}
                  floatingToolbar={this.floating}
                  disabled={this.disabled}
                  readonly={this.readonly}
                  variant={variant}
                  disabledMinHeight={this.disabledMinHeight}
                  disabledMaxHeight={this.disabledMaxHeight}
                />
              ))}
            </div>
            <div class="pg-columns__sub">
              <VSelect
                label="size"
                size="sm"
                v-model={this.size}
                items={CONTROL_SIZES.map((value) => ({
                  value,
                  label: value,
                }))}
              />
              <VSwitch size="sm" v-model={this.disabled}>
                Disabled
              </VSwitch>
              <VSwitch size="sm" v-model={this.readonly}>
                Readonly
              </VSwitch>
              <VSwitch size="sm" v-model={this.floating}>
                Floating
              </VSwitch>
              <VSwitch size="sm" v-model={this.disabledMinHeight}>
                Disabled min height
              </VSwitch>
              <VSwitch size="sm" v-model={this.disabledMaxHeight}>
                Disabled max height
              </VSwitch>
            </div>
          </div>
        </DocsSection>
      </div>
    );
  },
});

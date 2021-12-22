import { defineComponent, ref } from 'vue';
import {
  VHero,
  VWysiwygEditor,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  CONTROL_FIELD_VARIANTS,
  ControlFieldVariant,
  VSelect,
  WysiwygTextColorTool,
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

const tools = [
  WysiwygTextColorTool,
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
      this is a basic <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
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

    return {
      text1,
      size,
      variant,
      disabled,
      readonly,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Wysiwygs</VHero>
        <DocsSection title="Basic">
          <VWysiwygEditor
            label="日本語"
            tools={tools}
            v-model={this.text1}
            counter={100}
            // maxlength="100"
            variant="filled"
          />

          <div
            class="wysiwyg"
            style={{ maxHeight: '200px', overflow: 'auto' }}
            v-html={this.text1}
          />
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              {CONTROL_FIELD_VARIANTS.map((variant) => (
                <VWysiwygEditor
                  label={variant}
                  tools={tools}
                  required
                  placeholder="プレースホルダー"
                  hint="これは入力ヒントテキストです。"
                  counter
                  maxlength="100"
                  size={this.size}
                  disabled={this.disabled}
                  readonly={this.readonly}
                  variant={variant}
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
            </div>
          </div>
        </DocsSection>
      </div>
    );
  },
});

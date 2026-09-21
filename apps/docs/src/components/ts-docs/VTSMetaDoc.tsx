import './VTSMetaDoc.scss';

import {
  MetaDoc,
  MetaDocLinkSummary,
  ParsedComment,
} from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType, computed, ref, shallowRef } from 'vue';
import { VMenu } from '@fastkit/vui';
import { VMarked } from '../VMarked';
import { VCode } from '../VCode';

/** Marks a rendered symbol reference, and indexes it into the preview list. */
const SYMBOL_INDEX_ATTR = 'data-tsdoc-symbol';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]);
}

interface RenderedComment {
  /** Markdown for the whole comment */
  code: string;
  /** Previews to open, in the order the references appear */
  summaries: MetaDocLinkSummary[];
}

/**
 * Render one comment to markdown, collecting the previews it needs.
 *
 * A `{@link}` arrives in three shapes and only one of them is somewhere the
 * reader can be sent. A URL stays a link. A symbol reference that resolved
 * becomes a button that shows the declaration in place -- following it would
 * mean leaving the paragraph it explains. Anything else falls back to code,
 * which reads better than an anchor that goes nowhere.
 *
 * Parts are contiguous spans of one comment, so they are joined with nothing
 * between them -- a separator would break a sentence that a `{@link}` sits in
 * the middle of. This mirrors `metaDocPartToString` in `@fastkit/ts-tiny-meta`.
 */
function renderComment(comment: ParsedComment): RenderedComment {
  const summaries: MetaDocLinkSummary[] = [];
  const code = comment.parts
    .map((part) => {
      const { text, link } = part;
      if (!link) return text;

      const { name, url, summary } = link;
      if (url) return `[${name}](${url})`;
      if (!summary) return `\`${name}\``;

      const index = summaries.push(summary) - 1;
      return `<a class="VTSMetaDoc__symbol" ${SYMBOL_INDEX_ATTR}="${index}" role="button" tabindex="0">${escapeHtml(
        name,
      )}</a>`;
    })
    .join('');

  return { code, summaries };
}

/** The declaration a symbol reference resolves to, one level deep. */
const VTSMetaDocPreview = defineComponent({
  name: 'VTSMetaDocPreview',
  props: {
    value: {
      type: Object as PropType<MetaDocLinkSummary>,
      required: true,
    },
  },
  setup(props) {
    const code = computed(() => {
      const { text, truncated } = props.value;
      return truncated ? `${text}\n  // …` : text;
    });

    return () => (
      <div class="VTSMetaDoc__preview" style={{ maxWidth: '640px' }}>
        {props.value.description && (
          <VMarked
            class="VTSMetaDoc__preview__description"
            code={props.value.description}
          />
        )}
        <VCode language="ts" code={code.value} />
      </div>
    );
  },
});

export const VTSMetaDoc = defineComponent({
  name: 'VTSMetaDoc',
  props: {
    value: {
      type: Object as PropType<MetaDoc>,
      required: true,
    },
  },
  setup(props) {
    const rendered = computed(() => renderComment(props.value.description));
    const examples = computed(() =>
      props.value.tags.filter((tag) => tag.name === 'example'),
    );

    const activator = shallowRef<HTMLElement>();
    const preview = shallowRef<MetaDocLinkSummary>();
    const opened = ref(false);

    /**
     * The comment is rendered as HTML rather than as components, so a
     * reference inside it cannot carry its own handler. One delegated listener
     * and one menu serve every reference in the comment.
     */
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement | null)?.closest?.(
        `[${SYMBOL_INDEX_ATTR}]`,
      );
      if (!el) return;

      ev.preventDefault();

      const summary =
        rendered.value.summaries[
          Number((el as HTMLElement).dataset.tsdocSymbol)
        ];
      if (!summary) return;

      preview.value = summary;
      activator.value = el as HTMLElement;
      opened.value = true;
    };

    return () => (
      <div class="VTSMetaDoc" onClick={onClick}>
        <VMarked code={rendered.value.code} />
        {examples.value.length > 0 && (
          <div>
            <h4
              style={{
                marginBottom: '0px',
                fontSize: '10px',
                border: 'solid 1px',
                display: 'inline-block',
                padding: '2px 4px',
                lineHeight: 1,
                borderRadius: '4px',
                opacity: 0.8,
              }}>
              Example
            </h4>
            {examples.value.map((example, index) => (
              <VMarked key={index} code={example.text} />
            ))}
          </div>
        )}
        <VMenu
          modelValue={opened.value}
          onUpdate:modelValue={(value) => {
            opened.value = value;
          }}
          activator={activator.value}
          openOnClick={false}
          v-slots={{
            default: () =>
              preview.value && <VTSMetaDocPreview value={preview.value} />,
          }}
        />
      </div>
    );
  },
});

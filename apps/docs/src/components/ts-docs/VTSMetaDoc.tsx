import { MetaDoc, MetaDocPart, ParsedComment } from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType, computed } from 'vue';
import { VMarked } from '../VMarked';

function partToMarkdownChunk(part: MetaDocPart): string {
  const { text, link } = part;
  if (!link) return text;
  const { name, url } = link;
  return `[${name}](${url})`;
}

/**
 * Parts are contiguous spans of one comment, so they are joined with nothing
 * between them -- a separator would break a sentence that a `{@link}` sits in
 * the middle of. This mirrors `metaDocPartToString` in `@fastkit/ts-tiny-meta`.
 */
function commentToMarkDown(comment: ParsedComment) {
  return comment.parts.map(partToMarkdownChunk).join('');
}

export const VTSMetaDoc = defineComponent({
  name: 'VTSMetaDoc',
  props: {
    value: {
      type: Object as PropType<MetaDoc>,
      required: true,
    },
  },
  setup(props) {
    const comment = computed(() => commentToMarkDown(props.value.description));
    const examples = computed(() =>
      props.value.tags.filter((tag) => tag.name === 'example'),
    );
    return () => (
      <div class="VTSMetaDoc">
        <VMarked code={comment.value} />
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
      </div>
    );
  },
});

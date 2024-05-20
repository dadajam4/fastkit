import { MetaDoc, MetaDocPart, ParsedComment } from '@fastkit/ts-tiny-meta';
import { defineComponent, PropType, computed } from 'vue';
import { VMarked } from '../VMarked';

const TRIM_PART_RE = /^(\/\*\*\n\s\*\s)/;

function partToMarkdownChunk(part: MetaDocPart): string {
  let { text } = part;
  const { link } = part;
  text = text.replace(TRIM_PART_RE, '');
  if (!link) return text;
  const { name, url } = link;
  return `[${name}](${url})`;
}

function commentToMarkDown(comment: ParsedComment) {
  return comment.parts.map(partToMarkdownChunk).join('\n');
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

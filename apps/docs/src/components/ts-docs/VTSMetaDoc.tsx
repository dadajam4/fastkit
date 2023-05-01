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
    return () => {
      return (
        <div class="VTSMetaDoc">
          <VMarked code={comment.value} />
        </div>
      );
    };
  },
});

import { defineComponent, PropType, computed } from 'vue';
import { ParameterMeta, ParameterDoc } from '@fastkit/ts-tiny-meta';
import { VPaper } from '@fastkit/vui';
import * as styles from './VTSParameterTable.css';

export interface ParameterTableItem {
  __isParameterTableItem: true;
  key: string;
  name: string;
  optional: boolean;
  text: string;
  defaultValue?: string;
  docs: string[];
}

export type ParameterTableItemSource = ParameterMeta | ParameterTableItem;

function isParameterTableItem(
  source: ParameterTableItemSource,
): source is ParameterTableItem {
  return (source as ParameterTableItem).__isParameterTableItem || false;
}

function parameterDoc2HTML(doc: ParameterDoc): string {
  return doc.parts
    .map(({ text, link }) => {
      if (!link) return text;
      const url = (link.type === 'linkPlain' && link.url) || '';
      const title = link.type === 'link' ? link.url : '';

      return `<a href="${url || 'javascript:void(0);'}"${
        url && ' target="_blank" rel="noopener"'
      }${title && ` title="${title}"`}>${link.name}</a>`;
    })
    .join('');
}

export function normalizeParameterTableItemSource(
  source: ParameterTableItemSource,
  keyPrefix = '',
): ParameterTableItem {
  if (isParameterTableItem(source)) return source;

  return {
    __isParameterTableItem: true,
    key: `${keyPrefix}${source.name}`,
    name: source.name,
    optional: source.optional,
    text: source.text,
    defaultValue: source.defaultValue,
    docs: source.docs.map(parameterDoc2HTML),
  };
}

export function normalizeParameterTableItemSources(
  sources: ParameterTableItemSource[],
): ParameterTableItem[] {
  return sources.map((source, i) =>
    normalizeParameterTableItemSource(source, `${i}:`),
  );
}

export const VTSParameterTable = defineComponent({
  name: 'VTSParameterTable',
  props: {
    value: {
      type: Array as PropType<ParameterTableItemSource[]>,
      required: true,
    },
  },
  setup(props, ctx) {
    const itemsRef = computed(() =>
      normalizeParameterTableItemSources(props.value),
    );

    const headClasses = [styles.cellBase, styles.headCell];
    const cellClasses = ['notranslate', styles.cellBase, styles.cell];

    return () => {
      const items = itemsRef.value;

      return (
        <VPaper class={['VTSParameterTable']}>
          <table class={styles.table}>
            <thead>
              <tr>
                <th class={headClasses}>Name</th>
                <th class={headClasses}>Type</th>
                <th class={headClasses}>Default</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const rows = [
                  <tr key={item.key}>
                    <td class={cellClasses}>
                      <span class={styles.name}>{item.name}</span>
                      {!item.optional && (
                        <span class={styles.requiredChip}>*</span>
                      )}
                    </td>
                    <td class={cellClasses}>
                      <code>{item.text}</code>
                    </td>
                    <td class={cellClasses}>{item.defaultValue}</td>
                  </tr>,
                ];

                if (item.docs.length) {
                  rows.push(
                    <tr key={`${item.key}:description`}>
                      <td colspan={3} class={styles.description}>
                        {item.docs.map((doc, i) => (
                          <div key={i} innerHTML={doc} />
                        ))}
                      </td>
                    </tr>,
                  );
                }

                return rows;
              })}
            </tbody>
          </table>
        </VPaper>
      );
    };
  },
});

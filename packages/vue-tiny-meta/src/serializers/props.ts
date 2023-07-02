import {
  Symbol as MorphSymbol,
  CallExpression,
} from '@fastkit/ts-tiny-meta/ts-morph';
import {
  SourceFileExporter,
  getTypeText,
  TYPE_TEXT_MAPPING,
} from '@fastkit/ts-tiny-meta/ts';
import { PropMeta, UserFilter, PropResolver, ResolverContext } from '../types';
import {
  getMetaDocsByNodeAndSymbol,
  resolveUserFilter,
  trimCommonSubstring,
  applyResolvers,
} from '../utils';

export function serializeProps(
  exporter: SourceFileExporter,
  resolverContext: ResolverContext,
  defineExpression: CallExpression,
  propsSymbol: MorphSymbol,
  userFilter?: UserFilter,
  resolvers?: PropResolver[],
): PropMeta[] {
  const filter = resolveUserFilter(userFilter);
  const $propsDec = propsSymbol.getDeclarations()[0];
  const $propsType = propsSymbol.getTypeAtLocation($propsDec);
  const filteredProperties = $propsType
    .getProperties()
    .filter((prop) => filter(prop.getName()));

  const props: PropMeta[] = [];

  filteredProperties.forEach((prop) => {
    const name = prop.getName();

    const sourceFile = trimCommonSubstring(
      prop.getDeclarations()[0]?.getSourceFile().getFilePath() || '',
      exporter.workspace.dirPath,
    );

    const propDeclaration = undefined;
    const dec = prop.getDeclarations()[0] || defineExpression;
    const type = prop.getTypeAtLocation(dec);
    const docs = getMetaDocsByNodeAndSymbol(exporter, propDeclaration, prop);

    const unionTypes = type.getUnionTypes();
    const isRequired = unionTypes.length === 0;
    const _types = isRequired
      ? [type]
      : unionTypes.filter((type) => !type.isUndefined());
    const values: string[] = [];
    const types = _types.map((type) => {
      const text = getTypeText(type, dec);
      const literal = type.getLiteralValue();
      if (typeof literal === 'string' || typeof literal === 'number') {
        values.push(String(literal));
      }
      return {
        text,
        literal,
      };
    });
    const text = types.map((type) => type.text).join(' | ');
    const defaultValue = docs[0]?.tags.find(
      (tag) => tag.name === 'default' || tag.name === 'defaultValue',
    )?.text;

    const meta: PropMeta = {
      name,
      description: docs[0]?.description.text,
      type: {
        name: TYPE_TEXT_MAPPING[text] || text,
      },
      required: isRequired,
      defaultValue: defaultValue
        ? {
            value: defaultValue,
          }
        : undefined,
      values: values.length ? values : undefined,
      docs,
      sourceFile,
    };

    const applied = applyResolvers(meta, resolverContext, resolvers);

    if (applied) {
      props.push(applied);
    }

    props.push(meta);
  });

  return props;
}

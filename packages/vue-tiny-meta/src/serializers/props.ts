import {
  Symbol as MorphSymbol,
  CallExpression,
} from '@fastkit/ts-tiny-meta/ts-morph';
import {
  SourceFileExporter,
  _extractMetaDocs,
  getTypeText,
} from '@fastkit/ts-tiny-meta/ts';
import { PropMeta, UserFilter } from '../types';
import { getMetaDocsByNodeAndSymbol, resolveUserFilter } from '../utils';

export function serializeProps(
  exporter: SourceFileExporter,
  defineExpression: CallExpression,
  propsSymbol: MorphSymbol,
  userfilter?: UserFilter,
): PropMeta[] {
  const filter = resolveUserFilter(userfilter);
  const $propsDec = propsSymbol.getDeclarations()[0];
  const $propsType = propsSymbol.getTypeAtLocation($propsDec);
  const filteredProperties = $propsType
    .getProperties()
    .filter((prop) => filter(prop.getName()));

  return filteredProperties.map((prop) => {
    const name = prop.getName();
    const propDeclaration = prop.getDeclarations()[0];
    const dec = prop.getDeclarations()[0] || defineExpression;
    const type = prop.getTypeAtLocation(dec);
    const docs = getMetaDocsByNodeAndSymbol(exporter, propDeclaration, prop);

    const unionTypes = type.getUnionTypes();
    const isRequired = unionTypes.length === 0;
    const _types = isRequired
      ? [type]
      : unionTypes.filter((type) => !type.isUndefined());
    const types = _types.map((type) => {
      const text = getTypeText(type, dec);
      const literal = type.getLiteralValue();
      return {
        text,
        literal,
      };
    });
    const text = types.map((type) => type.text).join(' | ');
    const defaultValue = docs[0]?.tags.find(
      (tag) => tag.name === 'default' || tag.name === 'defaultValue',
    )?.text;

    return {
      name,
      description: docs[0]?.description.text,
      type: {
        name: text,
      },
      required: isRequired,
      defaultValue: defaultValue
        ? {
            value: defaultValue,
          }
        : undefined,
      values: [],
      docs,
    };
  });
}

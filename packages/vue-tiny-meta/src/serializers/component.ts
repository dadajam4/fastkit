import { Node, CallExpression } from '@fastkit/ts-tiny-meta/ts-morph';
import { SourceFileExporter, _extractMetaDocs } from '@fastkit/ts-tiny-meta/ts';
import { ComponentMeta } from '../types';
import { serializeProps } from './props';
import { serializeEmits } from './emits';
import { serializeSlots } from './slots';
import { SerializeVueOptions } from '../types';
import { resolveResolvers } from '../utils';

const EMIT_LIKE_PREFIX_RE = /^on[A-Z]/;

export function serializeDefineComponent(
  exporter: SourceFileExporter,
  defineExpression: CallExpression,
  options: SerializeVueOptions = {},
): Pick<ComponentMeta, 'props' | 'slots' | 'events'> & { optionName?: string } {
  const returnType = defineExpression.getReturnType().getApparentType();
  const constructor = returnType.getConstructSignatures()[0];
  const instanceType = constructor.getReturnType();
  const optionsNode = defineExpression.getArguments()[0];
  const optionsType = optionsNode.getType();

  const resolvers = resolveResolvers(options.resolvers);

  // let name = symbolName;
  let optionName: string | undefined;
  const nameDec = optionsType.getProperty('name')?.getDeclarations()[0];
  if (Node.isPropertyAssignment(nameDec)) {
    const nameAssignment = nameDec
      .getInitializer()
      ?.getType()
      .getLiteralValue();
    if (typeof nameAssignment === 'string') {
      optionName = nameAssignment;
    }
  }

  const propsSymbol = instanceType.getPropertyOrThrow('$props');
  const props = serializeProps(
    exporter,
    defineExpression,
    propsSymbol,
    options.ignoreProps,
    resolvers.prop,
  );

  const emitSymbol = instanceType.getPropertyOrThrow('$emit');
  const events = serializeEmits(
    exporter,
    optionsType,
    emitSymbol,
    options.ignoreEvents,
    resolvers.event,
  );

  const emitLikes = props.filter(
    (prop) => !prop.required && EMIT_LIKE_PREFIX_RE.test(prop.name),
  );

  emitLikes.forEach((emitLike) => {
    const index = props.indexOf(emitLike);
    props.splice(index, 1);
    if (events.some((emit) => emit.name === emitLike.name)) {
      return;
    }
    events.push({
      name: emitLike.name as `on${string}`,
      description: emitLike.description,
      type: emitLike.type,
      docs: emitLike.docs,
      sourceFile: emitLike.sourceFile,
    });
  });

  const slotsTypeSymbol = instanceType.getPropertyOrThrow('$slots');
  const slotsType = slotsTypeSymbol.getTypeAtLocation(defineExpression);
  const slots = serializeSlots(
    exporter,
    slotsType,
    options.ignoreSlots,
    resolvers.slot,
  );

  return {
    optionName,
    props,
    events,
    slots,
  };
}

import { Node, CallExpression } from '@fastkit/ts-tiny-meta/ts-morph';
import { SourceFileExporter, _extractMetaDocs } from '@fastkit/ts-tiny-meta/ts';
import { ComponentMeta } from '../types';
import { serializeProps } from './props';
import { serializeEmits } from './emits';
import { serializeSlots } from './slots';
import {
  SerializeVueOptions,
  ComponentDescription,
  ResolverContext,
} from '../types';
import {
  resolveResolvers,
  trimCommonSubstring,
  resolveSortOption,
  applyResolvers,
} from '../utils';

const EMIT_LIKE_PREFIX_RE = /^on[A-Z]/;

export function serializeDefineComponent(
  exporter: SourceFileExporter,
  exportName: string,
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

  const componentDesc: ComponentDescription = {
    exportName,
    optionName,
    sourceFile: trimCommonSubstring(
      defineExpression.getSourceFile()?.getFilePath() || '',
      exporter.workspace.dirPath,
    ),
  };

  const resolverCtx: ResolverContext = {
    component: componentDesc,
  };

  const propsSymbol = instanceType.getPropertyOrThrow('$props');
  const _props = serializeProps(
    exporter,
    defineExpression,
    propsSymbol,
    options.ignoreProps,
  );

  const emitSymbol = instanceType.getPropertyOrThrow('$emit');
  const _events = serializeEmits(
    exporter,
    optionsType,
    emitSymbol,
    options.ignoreEvents,
  );

  const emitLikes = _props.filter(
    (prop) => !prop.required && EMIT_LIKE_PREFIX_RE.test(prop.name),
  );

  emitLikes.forEach((emitLike) => {
    const index = _props.indexOf(emitLike);
    _props.splice(index, 1);
    if (_events.some((emit) => emit.name === emitLike.name)) {
      return;
    }
    _events.push({
      name: emitLike.name as `on${string}`,
      description: emitLike.description,
      type: emitLike.type,
      docs: emitLike.docs,
      sourceFile: emitLike.sourceFile,
    });
  });

  const slotsTypeSymbol = instanceType.getPropertyOrThrow('$slots');
  const slotsType = slotsTypeSymbol.getTypeAtLocation(defineExpression);
  const _slots = serializeSlots(exporter, slotsType, options.ignoreSlots);

  const props = applyResolvers(_props, resolverCtx, resolvers.prop);
  const events = applyResolvers(_events, resolverCtx, resolvers.event);
  const slots = applyResolvers(_slots, resolverCtx, resolvers.slot);

  const sort = resolveSortOption(options.sort);

  if (sort) {
    props.sort(sort);
    events.sort(sort);
    slots.sort(sort);
  }

  return {
    optionName,
    props,
    events,
    slots,
  };
}

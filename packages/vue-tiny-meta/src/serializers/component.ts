import {
  Node,
  CallExpression,
  Identifier,
} from '@fastkit/ts-tiny-meta/ts-morph';
import { SourceFileExporter, _extractMetaDocs } from '@fastkit/ts-tiny-meta/ts';
import {
  ComponentMeta,
  SerializeVueOptions,
  ComponentDescription,
  ResolverContext,
} from '../types';
import { serializeProps, serializePropsByType } from './props';
import { serializeEmits } from './emits';
import { serializeSlots } from './slots';
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
  defineExpressionOrIdentifier: CallExpression | Identifier,
  options: SerializeVueOptions = {},
): Pick<ComponentMeta, 'props' | 'slots' | 'events'> & { optionName?: string } {
  const returnType = Node.isCallExpression(defineExpressionOrIdentifier)
    ? defineExpressionOrIdentifier.getReturnType().getApparentType()
    : defineExpressionOrIdentifier.getType().getApparentType();
  const constructor = returnType.getConstructSignatures().at(0);

  let optionsNode: Node | undefined;
  const argNodes = Node.isCallExpression(defineExpressionOrIdentifier)
    ? defineExpressionOrIdentifier.getArguments()
    : [];

  if (constructor) {
    optionsNode = argNodes[0];
  } else {
    optionsNode = argNodes[1];
  }

  const instanceType = constructor?.getReturnType();
  const optionsType = optionsNode?.getType();

  const resolvers = resolveResolvers(options.resolvers);

  let optionName: string | undefined;
  const nameDec = optionsType?.getProperty('name')?.getDeclarations()[0];
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
      defineExpressionOrIdentifier.getSourceFile()?.getFilePath() || '',
      exporter.workspace.dirPath,
    ),
  };

  const resolverCtx: ResolverContext = {
    component: componentDesc,
  };

  const propsSymbol = instanceType?.getPropertyOrThrow('$props');
  const _props = propsSymbol
    ? serializeProps(
        exporter,
        defineExpressionOrIdentifier,
        propsSymbol,
        options.ignoreProps,
      )
    : (() => {
        const sourceType = Node.isCallExpression(defineExpressionOrIdentifier)
          ? defineExpressionOrIdentifier.getReturnType()
          : defineExpressionOrIdentifier.getType();
        const signature = sourceType.getCallSignatures().at(0);
        const firstParam = signature?.getParameters().at(0);
        const propsType = firstParam?.getTypeAtLocation(
          defineExpressionOrIdentifier,
        );

        return propsType
          ? serializePropsByType(
              exporter,
              defineExpressionOrIdentifier,
              propsType,
              options.ignoreProps,
            )
          : [];
      })();

  const emitSymbol = instanceType?.getPropertyOrThrow('$emit');
  const _events = emitSymbol
    ? serializeEmits(exporter, optionsType, emitSymbol, options.ignoreEvents)
    : [];

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
      type: {
        names: [emitLike.type.name],
      },
      docs: emitLike.docs,
      sourceFile: emitLike.sourceFile,
    });
  });

  const slotsTypeSymbol = instanceType?.getPropertyOrThrow('$slots');
  const slotsType = slotsTypeSymbol?.getTypeAtLocation(
    defineExpressionOrIdentifier,
  );
  const _slots = slotsType
    ? serializeSlots(exporter, slotsType, options.ignoreSlots)
    : [];

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

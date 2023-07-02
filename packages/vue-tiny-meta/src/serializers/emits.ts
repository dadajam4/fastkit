import { Type, Symbol as MorphSymbol } from '@fastkit/ts-tiny-meta/ts-morph';
import {
  SourceFileExporter,
  _extractMetaDocs,
  getTypeText,
} from '@fastkit/ts-tiny-meta/ts';
import { MetaDoc } from '@fastkit/ts-tiny-meta';
import {
  EventMeta,
  UserFilter,
  EventResolver,
  ResolverContext,
} from '../types';
import {
  getMetaDocsByNodeAndSymbol,
  capitalize,
  resolveUserFilter,
  trimCommonSubstring,
  applyResolvers,
} from '../utils';

const EMIT_PAYLOAD_REPLACE_RE = /(^\[|\]$)/g;

export function serializeEmits(
  exporter: SourceFileExporter,
  resolverContext: ResolverContext,
  optionsType: Type,
  emitSymbol: MorphSymbol,
  userFilter?: UserFilter,
  resolvers?: EventResolver[],
): EventMeta[] {
  const filter = resolveUserFilter(userFilter);
  const $emitDec = emitSymbol.getDeclarations()[0];
  const $emitType = emitSymbol.getTypeAtLocation($emitDec);

  const fns: { name: string; text: string; sourceFile: string }[] = [];

  $emitType.getIntersectionTypes().forEach((emit) => {
    const signature = emit.getCallSignatures()[0];
    if (!signature) return;

    const [nameSymbol, payloadSymbol] = signature.getParameters();
    const name = nameSymbol.getTypeAtLocation($emitDec).getLiteralValue();
    if (typeof name !== 'string' || !filter(name)) return;

    const payloadType = payloadSymbol.getTypeAtLocation($emitDec);
    const payload = getTypeText(payloadType, $emitDec).replace(
      EMIT_PAYLOAD_REPLACE_RE,
      '',
    );
    const text = `(${payload}) => void`;

    const sourceFile = trimCommonSubstring(
      signature.getDeclaration()?.getSourceFile().getFilePath() || '',
      exporter.workspace.dirPath,
    );
    fns.push({ name, text, sourceFile });
  });

  const emitsSymbol = optionsType.getProperty('emits');
  const emitsDec = emitsSymbol?.getDeclarations()[0];
  if (!emitsDec) return [];
  const optionsEmitsType = emitsDec.getType();

  const events: EventMeta[] = [];

  fns.forEach(({ name, text, sourceFile }) => {
    const emit = optionsEmitsType.getProperty(name);
    let docs: MetaDoc[];

    // @TODO I really want to consider mixins and extensions, but for some reason I can't pick them up.
    if (emit) {
      // const dec = emit.getDeclarations()[0];
      // docs = getMetaDocsByNodeAndSymbol(exporter, dec, emit);
      // const dec = emit.getDeclarations()[0];
      docs = getMetaDocsByNodeAndSymbol(exporter, undefined, emit);
    } else {
      docs = [];
    }

    const meta: EventMeta = {
      name: `on${capitalize(name)}`,
      description: docs[0]?.description.text,
      type: {
        name: text,
      },
      docs,
      sourceFile,
    };

    const applied = applyResolvers(meta, resolverContext, resolvers);

    if (applied) {
      events.push(applied);
    }
  });

  return events;
}

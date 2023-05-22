import { Type, Symbol as MorphSymbol } from '@fastkit/ts-tiny-meta/ts-morph';
import { SourceFileExporter, _extractMetaDocs } from '@fastkit/ts-tiny-meta/ts';
import { MetaDoc } from '@fastkit/ts-tiny-meta';
import { EventMeta, UserFilter } from '../types';
import {
  getMetaDocsByNodeAndSymbol,
  capitalize,
  resolveUserFilter,
} from '../utils';

const EMIT_PAYLOAD_REPLACE_RE = /(^\[|\]$)/g;

export function serializeEmits(
  exporter: SourceFileExporter,
  optionsType: Type,
  emitSymbol: MorphSymbol,
  userFilter?: UserFilter,
): EventMeta[] {
  const filter = resolveUserFilter(userFilter);
  const $emitDec = emitSymbol.getDeclarations()[0];
  const $emitType = emitSymbol.getTypeAtLocation($emitDec);

  const fns: { name: string; text: string }[] = [];

  $emitType.getIntersectionTypes().forEach((emit) => {
    const signature = emit.getCallSignatures()[0];
    if (!signature) return;

    const [nameSymbol, payloadSymbol] = signature.getParameters();
    const name = nameSymbol.getTypeAtLocation($emitDec).getLiteralValue();
    if (typeof name !== 'string' || !filter(name)) return;

    const payloadType = payloadSymbol.getTypeAtLocation($emitDec);
    const payload = payloadType.getText().replace(EMIT_PAYLOAD_REPLACE_RE, '');
    const text = `(${payload}) => void`;
    fns.push({ name, text });
  });

  const emitsSymbol = optionsType.getProperty('emits');
  const emitsDec = emitsSymbol?.getDeclarations()[0];
  if (!emitsDec) return [];
  const optionsEmitsType = emitsDec.getType();

  return fns.map(({ name, text }) => {
    const emit = optionsEmitsType.getProperty(name);
    let docs: MetaDoc[];

    // @TODO I really want to consider mixins and extensions, but for some reason I can't pick them up.
    if (emit) {
      const dec = emit.getDeclarations()[0];
      docs = getMetaDocsByNodeAndSymbol(exporter, dec, emit);
    } else {
      docs = [];
    }
    return {
      name: `on${capitalize(name)}`,
      description: docs[0]?.description.text,
      type: {
        name: text,
      },
      docs,
    };
  });
}
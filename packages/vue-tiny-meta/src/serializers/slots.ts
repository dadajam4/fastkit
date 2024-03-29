import { Type } from '@fastkit/ts-tiny-meta/ts-morph';
import {
  SourceFileExporter,
  _extractMetaDocs,
  getTypeText,
} from '@fastkit/ts-tiny-meta/ts';
import { SlotMeta, UserFilter } from '../types';
import {
  getMetaDocsByNodeAndSymbol,
  resolveUserFilter,
  trimCommonSubstring,
} from '../utils';

export function serializeSlots(
  exporter: SourceFileExporter,
  slotsType: Type,
  userFilter?: UserFilter,
): SlotMeta[] {
  const filter = resolveUserFilter(userFilter);

  return slotsType
    .getProperties()
    .filter((slot) => filter(slot.getName()))
    .map((slot) => {
      const name = slot.getName();
      const slotDec = slot.getDeclarations()[0];
      // const docs = getMetaDocsByNodeAndSymbol(exporter, slotDec, slot);
      const docs = getMetaDocsByNodeAndSymbol(exporter, undefined, slot);
      const slotType = slotDec.getType();
      const unionTypes = slotType.getUnionTypes();
      const isOptional = slot.isOptional();
      const type =
        unionTypes.length > 0
          ? unionTypes.find((_type) => !_type.isUndefined()) || slotType
          : slotType;

      const sourceFile = trimCommonSubstring(
        slotDec.getSourceFile().getFilePath() || '',
        exporter.workspace.dirPath,
      );

      return {
        name: `v-slot:${name}`,
        description: docs[0]?.description.text,
        type: {
          name: getTypeText(type),
        },
        required: !isOptional,
        docs,
        sourceFile,
      };
    });
}

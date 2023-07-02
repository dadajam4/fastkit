import { Type } from '@fastkit/ts-tiny-meta/ts-morph';
import {
  SourceFileExporter,
  _extractMetaDocs,
  getTypeText,
} from '@fastkit/ts-tiny-meta/ts';
import { SlotMeta, UserFilter, SlotResolver } from '../types';
import {
  getMetaDocsByNodeAndSymbol,
  resolveUserFilter,
  trimCommonSubstring,
  applyResolvers,
} from '../utils';

export function serializeSlots(
  exporter: SourceFileExporter,
  slotsType: Type,
  userFilter?: UserFilter,
  resolvers?: SlotResolver[],
): SlotMeta[] {
  const filter = resolveUserFilter(userFilter);
  const slots: SlotMeta[] = [];

  slotsType
    .getProperties()
    .filter((slot) => filter(slot.getName()))
    .forEach((slot) => {
      const name = slot.getName();
      const slotDec = slot.getDeclarations()[0];
      // const docs = getMetaDocsByNodeAndSymbol(exporter, slotDec, slot);
      const docs = getMetaDocsByNodeAndSymbol(exporter, undefined, slot);
      const slotType = slotDec.getType();
      const unionTypes = slotType.getUnionTypes();
      const isOptional = slot.isOptional();
      const type =
        unionTypes.length > 0
          ? unionTypes.find((type) => !type.isUndefined()) || slotType
          : slotType;

      const sourceFile = trimCommonSubstring(
        slotDec.getSourceFile().getFilePath() || '',
        exporter.workspace.dirPath,
      );

      const meta: SlotMeta = {
        name: `v-slot:${name}`,
        description: docs[0]?.description.text,
        type: {
          name: getTypeText(type),
        },
        required: !isOptional,
        docs,
        sourceFile,
      };

      const applied = applyResolvers(meta, resolvers);

      if (applied) {
        slots.push(applied);
      }

      slots.push(meta);
    });
  return slots;
}

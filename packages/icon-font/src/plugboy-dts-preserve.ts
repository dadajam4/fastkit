import {
  DTSPreserveTypeTarget,
  DTSPreserveTypeSettings,
} from '@fastkit/plugboy';

const toDTSPreserveTypeTarget = (typeName: string): DTSPreserveTypeTarget => {
  return {
    from: new RegExp(`"__${typeName}__"`, 'g'),
    typeName,
  };
};

const toDTSPreserveTypeTargets = (
  typeNames: string[],
): DTSPreserveTypeTarget[] => typeNames.map(toDTSPreserveTypeTarget);

export function iconFontDTSPreserve(): DTSPreserveTypeSettings {
  return {
    targets: toDTSPreserveTypeTargets(['IconName']),
    pkg: '@fastkit/icon-font',
  };
}

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

export function mediaMatchDTSPreserve(): DTSPreserveTypeSettings {
  return {
    targets: toDTSPreserveTypeTargets(['MediaMatchKey']),
    pkg: '@fastkit/media-match',
  };
}

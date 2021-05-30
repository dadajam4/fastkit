import path from 'path';
import fs from 'fs-extra';
import { MediaMatchSettings, MediaMatchCondition } from './schemes';
import { esbuildRequire } from '@fastkit/node-util';
import { logger } from './logger';

const BANNER = `
/**
 * This is auto generated file.
 * Do not edit !!!
 *
 * @see: https://github.com/dadajam4/fastkit/tree/main/packages/media-match
 */
`.trim();

export interface MediaMatchGeneratorOptions {
  src: string | MediaMatchSettings;
  dest: string;
}

export async function generator(opts: MediaMatchGeneratorOptions) {
  const { src, dest } = opts;
  let settings: MediaMatchSettings;
  if (typeof src === 'string') {
    const { exports } = await esbuildRequire<{ default: MediaMatchSettings }>(
      path.resolve(src),
    );
    settings = exports.default;
  } else {
    settings = src;
  }
  const TS_DEST = path.join(dest, 'media-match.ts');
  const SCSS_DEST = path.join(dest, 'media-match.scss');

  const mediaMatches: MediaMatchCondition[] = [];

  const { breakPoints, customs, aliases } = settings;

  breakPoints.forEach((breakPoint, index) => {
    const { key } = breakPoint;
    const beforeDefine = breakPoints[index - 1];
    const beforeMax = beforeDefine && beforeDefine.max;
    const min = beforeMax != null ? beforeMax + 1 : null;
    const max = breakPoint.max || null;

    if (min && max) {
      mediaMatches.push(
        {
          key: `${key}AndDown`,
          condition: ['all', `(max-width:${max}px)`].join(' and '),
          description: `<= ${max}px`,
        },
        {
          key: `${key}AndUp`,
          condition: ['all', `(min-width:${min}px)`].join(' and '),
          description: `>= ${min}px`,
        },
      );
    }

    const conditions = ['all'];
    if (min) {
      conditions.push(`(min-width:${min}px)`);
    }
    if (max) {
      conditions.push(`(max-width:${max}px)`);
    }
    const condition = conditions.join(' and ');

    mediaMatches.push({
      key,
      condition,
      description: breakPoint.description || `>= ${min}px & <= ${max}px`,
    });
  });

  customs.forEach((custom) => {
    mediaMatches.push({
      ...custom,
      description: custom.description || '',
    });
  });

  Object.keys(aliases).forEach((key) => {
    const target = aliases[key];
    const same = mediaMatches.find((match) => match.key === target);
    if (same) {
      const index = mediaMatches.indexOf(same);
      mediaMatches.splice(index + 1, 0, {
        ...same,
        key,
        description: `Alias for '${target}'`,
      });
    }
  });

  const mediaMatchKeys = mediaMatches.map(({ key }) => `'${key}'`).join(' | ');

  const TS_SOURCE = `
${BANNER}

export type MediaMatchKey = ${mediaMatchKeys};

export interface MediaMatch {
  key: MediaMatchKey;
  condition: string;
  description: string;
}

export const mediaMatches: MediaMatch[] = ${JSON.stringify(
    mediaMatches,
    null,
    '  ',
  )};
  `.trim();

  const SCSS_SOURCE = `
${BANNER}

$media-matches: (
${mediaMatches
  .map((match) => {
    return (
      '  (\n    key: ' +
      match.key +
      ',\n    condition: ' +
      match.condition +
      ',\n  )'
    );
  })
  .join(',\n')},
);

$media-match-maps: (
  ${mediaMatches
    .map((match) => match.key + ': "' + match.condition + '"')
    .join(',\n  ')},
);
  `.trim();

  await fs.ensureDir(dest);
  fs.writeFileSync(TS_DEST, TS_SOURCE, 'utf-8');
  fs.writeFileSync(SCSS_DEST, SCSS_SOURCE, 'utf-8');

  logger.success(
    'created dynamic media match values:',
    ...[TS_DEST, SCSS_DEST].map((p) => `\n  -> ${p}`),
  );
}

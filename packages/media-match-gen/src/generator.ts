import path from 'node:path';
import fs from 'fs-extra';
import { MediaMatchSettings, MediaMatchDefine } from './schemes';
import {
  esbuildRequire,
  ESbuildRunner,
  ESbuildRequireResult,
} from '@fastkit/node-util';
import { logger } from './logger';
import { EV } from '@fastkit/ev';

const BANNER = `
/**
 * This is auto generated file.
 * Do not edit !!!
 *
 * @see: https://github.com/dadajam4/fastkit/tree/main/packages/media-match-gen
 */
`.trim();

export interface MediaMatchGeneratorOptions {
  src: string | MediaMatchSettings;
  dest: string;
}

export interface MediaMatchGeneratorResult {
  ts: {
    path: string;
  };
  scss: {
    path: string;
  };
}

export async function generator(
  opts: MediaMatchGeneratorOptions,
): Promise<MediaMatchGeneratorResult> {
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

  const mediaMatches: MediaMatchDefine[] = [];

  let { breakpoints } = settings;
  const { customs } = settings;

  breakpoints = breakpoints.sort((a, b) => {
    const am = a.min;
    const bm = b.min;
    if (am < bm) return -1;
    if (am > bm) return 1;
    return 0;
  });

  breakpoints.forEach((breakpoint /*, index*/) => {
    const { key, min, description } = breakpoint;
    // const beforeDefine = breakpoints[index - 1];
    // const nextDefine = breakpoints[index - 1];
    // const beforeMax = beforeDefine && beforeDefine.max;
    // const min = beforeMax != null ? beforeMax + 1 : null;
    // const max = breakpoint.max || null;
    mediaMatches.push({
      key,
      condition: ['all', `(min-width:${min}px)`].join(' and '),
      description: description || `>= ${min}px`,
    });

    // if (min && max) {
    //   mediaMatches.push(
    //     {
    //       key: `${key}AndDown`,
    //       condition: ['all', `(max-width:${max}px)`].join(' and '),
    //       description: `<= ${max}px`,
    //     },
    //     {
    //       key: `${key}AndUp`,
    //       condition: ['all', `(min-width:${min}px)`].join(' and '),
    //       description: `>= ${min}px`,
    //     },
    //   );
    // }

    // const conditions = ['all'];
    // if (min) {
    //   conditions.push(`(min-width:${min}px)`);
    // }
    // if (max) {
    //   conditions.push(`(max-width:${max}px)`);
    // }
    // const condition = conditions.join(' and ');

    // mediaMatches.push({
    //   key,
    //   condition,
    //   description: breakpoint.description || `>= ${min}px & <= ${max}px`,
    // });
  });

  customs.forEach((custom) => {
    mediaMatches.push({
      ...custom,
      description: custom.description || '',
    });
  });

  // Object.keys(aliases).forEach((key) => {
  //   const target = aliases[key];
  //   const same = mediaMatches.find((match) => match.key === target);
  //   if (same) {
  //     const index = mediaMatches.indexOf(same);
  //     mediaMatches.splice(index + 1, 0, {
  //       ...same,
  //       key,
  //       description: `Alias for '${target}'`,
  //     });
  //   }
  // });

  const TS_SOURCE = `
/* eslint-disable */
// @ts-nocheck
${BANNER}

import type { MediaMatchKey, MediaMatchKeyMap } from '@fastkit/media-match';
import { registerMediaMatchConditions } from '@fastkit/media-match';

declare module "@fastkit/media-match" {
  export interface MediaMatchKeyMap {
${mediaMatches.map(({ key }) => `    '${key}': true,`).join('\n')}
  }
}

export interface MediaMatch {
  key: MediaMatchKey;
  condition: string;
  description: string;
}

export const mediaMatches = registerMediaMatchConditions(${JSON.stringify(
    mediaMatches,
    null,
    2,
  )});

export type { MediaMatchKey } from '@fastkit/media-match';
  `.trim();

  const SCSS_SOURCE = `
/* stylelint-disable */
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

$mq-each-target: null;
$mq-each-prefix: null;
$mq-each-prefix-org: null;

@function media-match-to-string($list, $glue: '', $is-nested: false) {
  $result: null;

  @for $i from 1 through length($list) {
    $e: nth($list, $i);

    @if type-of($e) == list {
      $result: $result#{media-match-to-string($e, $glue, true)};
    } @else {
      $result: if(
        $i != length($list) or $is-nested,
        $result#{$e}#{$glue},
        $result#{$e}
      );
    }
  }

  @return $result;
}

// Multiple conditions can be specified
@mixin mq($targets...) {
  $conditions: ();
  $len: length($targets);

  @for $i from 1 through $len {
    $target: nth($targets, $i);
    $condition: null;

    $condition: map-get($media-match-maps, $target);
    $conditions: append($conditions, $condition);
  }

  $conditionsStr: media-match-to-string($conditions, ', ');

  @media #{$conditionsStr} {
    @content;
  }
}

@mixin mq-each() {
  $mq-each-target: null !global;
  $mq-each-prefix: null !global;
  $mq-each-prefix-org: null !global;
  $is-first: true;

  @each $define in $media-matches {
    $target: map-get($define, key);
    $target-condition: map-get($define, condition);

    $mq-each-target: $target !global;
    $mq-each-prefix-org: #{$target + '-'} !global;
    $mq-each-prefix: if($is-first, '', $mq-each-prefix-org) !global;
    $is-first: false;

    @if $target-condition == null {
      @content;
    }

    @else {
      // @media #{$target-condition} {
      //   @content;
      // }

      @include mq($target) {
        @content;
      }
    }
  }
}
  `.trim();

  await fs.ensureDir(dest);
  fs.writeFileSync(TS_DEST, TS_SOURCE, 'utf-8');
  fs.writeFileSync(SCSS_DEST, SCSS_SOURCE, 'utf-8');

  logger.success(
    'created dynamic media match values:',
    ...[TS_DEST, SCSS_DEST].map((p) => `\n  -> ${p}`),
  );

  return {
    ts: { path: TS_DEST },
    scss: { path: SCSS_DEST },
  };
}

export interface MediaMatchGeneratorRunnerOptions {
  src: string;
  dest: string;
  watch?: boolean;
}

export interface MediaMatchGeneratorRunnerEventMap {
  load: ESbuildRequireResult<MediaMatchGeneratorResult>;
}

export class MediaMatchGeneratorRunner extends EV {
  private runner: ESbuildRunner<MediaMatchGeneratorResult>;
  readonly src: string;
  readonly dest: string;

  constructor(opts: MediaMatchGeneratorRunnerOptions) {
    super();
    this.src = opts.src;
    this.dest = opts.dest;
    this.resolver = this.resolver.bind(this);
    this.runner = new ESbuildRunner({
      entry: opts.src,
      watch: opts.watch,
      resolver: this.resolver,
    });
    this.runner.on('build', (result) => {
      this.emit('load', result);
    });
  }

  run() {
    return this.runner.run();
  }

  async resolver(
    result: ESbuildRequireResult<{
      default: MediaMatchSettings;
    }>,
  ): Promise<MediaMatchGeneratorResult> {
    const settings = result.exports.default;
    const _result = await generator({
      src: settings,
      dest: this.dest,
    });
    return _result;
  }
}

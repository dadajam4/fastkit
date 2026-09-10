import path from 'node:path';
import fs from 'fs-extra';
import {
  esbuildRequire,
  ESbuildRunner,
  ESbuildRequireResult,
} from '@fastkit/node-util';
import { EV } from '@fastkit/ev';
import {
  MediaMatchSettings,
  MediaMatchDefine,
  DEFAULT_MEDIA_MATCH_RUNTIME_MODULE,
} from './schema';
import { logger } from './logger';

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
  /**
   * Module the generated code imports `registerMediaMatchConditions` /
   * `MediaMatchKey` from, and whose `MediaMatchKeyMap` it augments with the
   * generated keys.
   *
   * The generated files live in the *consuming* project, so this specifier is
   * resolved from there -- and pnpm places into a project's `node_modules` only
   * what the project itself declares, not what a peer declaration asks for. So
   * whatever this names becomes a package the project has to declare.
   *
   * Point it at a module the project already declares and that re-exports
   * `@fastkit/media-match` -- a UI kit built on it, say -- and the project needs
   * nothing beyond that kit. Module augmentation follows a re-export to the
   * interface it aliases, so `MediaMatchKeyMap` still merges into the one
   * `@fastkit/media-match` declares.
   *
   * @default '@fastkit/media-match'
   */
  runtimeModule?: string;
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
  const runtimeModule =
    opts.runtimeModule ?? DEFAULT_MEDIA_MATCH_RUNTIME_MODULE;
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

  breakpoints.forEach((breakpoint /* , index */) => {
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

import type { MediaMatchKey, MediaMatchKeyMap } from '${runtimeModule}';
import { registerMediaMatchConditions } from '${runtimeModule}';

declare module "${runtimeModule}" {
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

export type { MediaMatchKey } from '${runtimeModule}';
  `.trim();

  const SCSS_SOURCE = `

/* stylelint-disable */
${BANNER}

@use "sass:list" as _media_match_gen_list;
@use "sass:map" as _media_match_gen_map;
@use "sass:meta" as _media_match_gen_meta;

$media-matches: (
${mediaMatches
  .map(
    (match) =>
      `  (\n    key: ${match.key},\n    condition: ${match.condition},\n  )`,
  )
  .join(',\n')},
);

$media-match-maps: (
  ${mediaMatches
    .map((match) => `${match.key}: "${match.condition}"`)
    .join(',\n  ')},
);

$mq-each-target: null;
$mq-each-prefix: null;
$mq-each-prefix-org: null;

@function media-match-to-string($list, $glue: '', $is-nested: false) {
  $result: null;

  @for $i from 1 through _media_match_gen_list.length($list) {
    $e: _media_match_gen_list.nth($list, $i);

    @if _media_match_gen_meta.type-of($e) == list {
      $result: $result#{media-match-to-string($e, $glue, true)};
    } @else {
      @if $i != _media_match_gen_list.length($list) or $is-nested {
        $result: $result#{$e}#{$glue};
      } @else {
        $result: $result#{$e};
      }
    }
  }

  @return $result;
}

// Multiple conditions can be specified
@mixin mq($targets...) {
  $conditions: ();
  $len: _media_match_gen_list.length($targets);

  @for $i from 1 through $len {
    $target: _media_match_gen_list.nth($targets, $i);
    $condition: null;

    $condition: _media_match_gen_map.get($media-match-maps, $target);
    $conditions: _media_match_gen_list.append($conditions, $condition);
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
    $target: _media_match_gen_map.get($define, key);
    $target-condition: _media_match_gen_map.get($define, condition);

    $mq-each-target: $target !global;
    $mq-each-prefix-org: #{$target + '-'} !global;
    @if $is-first {
      $mq-each-prefix: '' !global;
    } @else {
      $mq-each-prefix: $mq-each-prefix-org !global;
    }
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
  /**
   * Module the generated code imports `registerMediaMatchConditions` /
   * `MediaMatchKey` from, and whose `MediaMatchKeyMap` it augments with the
   * generated keys.
   *
   * The generated files live in the *consuming* project, so this specifier is
   * resolved from there -- and pnpm places into a project's `node_modules` only
   * what the project itself declares, not what a peer declaration asks for. So
   * whatever this names becomes a package the project has to declare.
   *
   * Point it at a module the project already declares and that re-exports
   * `@fastkit/media-match` -- a UI kit built on it, say -- and the project needs
   * nothing beyond that kit. Module augmentation follows a re-export to the
   * interface it aliases, so `MediaMatchKeyMap` still merges into the one
   * `@fastkit/media-match` declares.
   *
   * @default '@fastkit/media-match'
   */
  runtimeModule?: string;
}

export interface MediaMatchGeneratorRunnerEventMap {
  load: ESbuildRequireResult<MediaMatchGeneratorResult>;
}

export class MediaMatchGeneratorRunner extends EV {
  private runner: ESbuildRunner<MediaMatchGeneratorResult>;

  readonly src: string;

  readonly dest: string;

  /** @see {@link MediaMatchGeneratorOptions.runtimeModule} */
  readonly runtimeModule: string;

  constructor(opts: MediaMatchGeneratorRunnerOptions) {
    super();
    this.src = opts.src;
    this.dest = opts.dest;
    this.runtimeModule =
      opts.runtimeModule ?? DEFAULT_MEDIA_MATCH_RUNTIME_MODULE;
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
      runtimeModule: this.runtimeModule,
    });
    return _result;
  }
}

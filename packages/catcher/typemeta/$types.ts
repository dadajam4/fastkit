import { extractMeta } from '@fastkit/ts-tiny-meta';

import {
  build,
  createCatcherResolver,
  createCatcherNormalizer,
  CatcherBuilderOptions,
  Catcher,
  CatcherConstructor,
} from '../src';

export const buildMeta = extractMeta(build);

export const createCatcherResolverMeta = extractMeta(createCatcherResolver);

export const createCatcherNormalizerMeta = extractMeta(createCatcherNormalizer);

export const CatcherBuilderOptionsMeta = extractMeta<CatcherBuilderOptions>();

export const CatcherMeta = extractMeta<Catcher>();

export const CatcherConstructorMeta = extractMeta<CatcherConstructor>();

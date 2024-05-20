import { extractMeta } from '@fastkit/ts-tiny-meta';

import {
  type LoadingRequestOptions,
  type LoadingRequest,
  type LoadingScope,
  useLoading,
} from '../src';

export const useLoadingMeta = extractMeta(useLoading);
export const LoadingScopeMeta = extractMeta<LoadingScope>();
export const LoadingRequestMeta = extractMeta<LoadingRequest>();
export const LoadingRequestOptionsMeta = extractMeta<LoadingRequestOptions>();

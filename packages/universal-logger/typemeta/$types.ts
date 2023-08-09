import { extractMeta } from '@fastkit/ts-tiny-meta';

import {
  LogLevel,
  LogLevelThreshold,
  levelToIndex,
  isAvailableLogLevel,
  LoggerPayload,
  Transformer,
  TransportFunc,
  Transport,
  LoggerOptions,
  NormalizedLoggerOptions,
  LoggerBuilderOptions,
  Logger,
  combineFormatter,
  LoggerBuilderResult,
  loggerBuilder,
  SanitizerOptions,
  SanitizerTransformer,
  CloneOptions,
  CloneTransformer,
  ConsoleTransportSettings,
  ConsoleTransport,
  STDOTransportSettings,
  STDOTransport,
  DDTransportSettings,
  DDTransport,
} from '../src';

// Builder API
export const loggerBuilderMeta = extractMeta(loggerBuilder);
export const LoggerBuilderOptionsMeta = extractMeta<LoggerBuilderOptions>();
export const LoggerBuilderResultMeta = extractMeta<LoggerBuilderResult>();
export const LoggerMeta = extractMeta(Logger);
export const LoggerOptionsMeta = extractMeta<LoggerOptions>();
export const LogLevelMeta = extractMeta<LogLevel>();
export const LoggerPayloadMeta = extractMeta<LoggerPayload>();
export const TransformerMeta = extractMeta<Transformer>();
export const TransportFuncMeta = extractMeta<TransportFunc>();
export const TransportMeta = extractMeta<Transport>();
export const LogLevelThresholdMeta = extractMeta<LogLevelThreshold>();
export const levelToIndexMeta = extractMeta(levelToIndex);
export const isAvailableLogLevelMeta = extractMeta(isAvailableLogLevel);
export const NormalizedLoggerOptionsMeta =
  extractMeta<NormalizedLoggerOptions>();
export const combineFormatterMeta = extractMeta(combineFormatter);

// Builtin Transformers
export const SanitizerTransformerMeta = extractMeta(SanitizerTransformer);
export const SanitizerOptionsMeta = extractMeta<SanitizerOptions>();
export const CloneTransformerMeta = extractMeta(CloneTransformer);
export const CloneOptionsMeta = extractMeta<CloneOptions>();

// Builtin Transports
export const ConsoleTransportMeta = extractMeta(ConsoleTransport);
export const ConsoleTransportSettingsMeta =
  extractMeta<ConsoleTransportSettings>();
export const STDOTransportMeta = extractMeta(STDOTransport);
export const STDOTransportSettingsMeta = extractMeta<STDOTransportSettings>();
export const DDTransportMeta = extractMeta(DDTransport);
export const DDTransportSettingsMeta = extractMeta<DDTransportSettings>();

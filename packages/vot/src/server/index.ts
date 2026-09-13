/**
 * @file Declaration surface for a vot server entry.
 *
 * This module holds nothing but an identity function and types, so a bundled
 * server entry carries no runtime code from vot. Keep it that way -- the serve
 * implementation lives in `@fastkit/vot/internal/serve`.
 */
export * from '../schema/server';

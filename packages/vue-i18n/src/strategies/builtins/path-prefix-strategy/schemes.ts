import type {
  RouteLocation,
  LocationAsPath,
  LocationAsRelativeRaw,
  RouteQueryAndHash,
  RouteLocationOptions,
  Router,
} from 'vue-router';

/**
 * Path-based route location settings
 *
 * @see {@link LocationAsPath}
 */
export type PathBaseLocation = RouteQueryAndHash &
  LocationAsPath &
  RouteLocationOptions;

/**
 * Relative-based root location setting
 *
 * @see {@link LocationAsRelativeRaw}
 */
export type RelativeTypeLocation = RouteQueryAndHash &
  LocationAsRelativeRaw &
  RouteLocationOptions;

/**
 * Resolved Route Locations
 *
 * @see {@link Router.resolve}
 */
export type ResolvedLocation = RouteLocation & { href: string };

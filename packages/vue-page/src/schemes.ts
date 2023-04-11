import {
  RouteLocation,
  RouterView,
  RouteLocationNormalizedLoaded,
} from 'vue-router';

export interface ResolvedRouteLocation extends RouteLocation {
  href: string;
}

type InstanceOf<T> = T extends new (...args: any[]) => infer R ? R : never;

export type RouterViewSlotProps = Parameters<
  NonNullable<InstanceOf<typeof RouterView>['$slots']['default']>
>[0];

export type WatchQueryOption = boolean | string[];

export type VuePageKeyOverride =
  | string
  | null
  | ((route: RouteLocationNormalizedLoaded) => string);

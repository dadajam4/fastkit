import { RouteLocation } from 'vue-router';

export interface ResolvedRouteLocation extends RouteLocation {
  href: string;
}

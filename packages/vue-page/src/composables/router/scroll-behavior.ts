import { ComponentCustomOptions } from 'vue';
import type { RouterScrollBehavior, RouteLocationNormalized } from 'vue-router';
import { getRouteMatchedComponents } from '@fastkit/vue-utils';
import { getSuspenseRouteBucket } from './suspense-route-bucket';

export type RawRouterScrollBehavior = 'top' | RouterScrollBehavior;

declare module '@vue/runtime-core' {
  export interface ComponentCustomOptions {
    scrollBehavior?: RawRouterScrollBehavior;
  }
}

export type ScrollBehaviorMessengerFn = (canceled: boolean) => any;

export class ScrollBehaviorMessenger {
  private static fns: ScrollBehaviorMessengerFn[] = [];

  static trigger() {
    this.fns.forEach((fn) => fn(false));
    this.fns = [];
  }

  static reserveNextPosition(position: any) {
    return new Promise<any>((resolve) => {
      this.fns.push((canceled) => {
        resolve(canceled ? undefined : position);
      });
    });
  }

  static release() {
    this.fns.forEach((fn) => fn(true));
    this.fns = [];
  }
}

function resolveRawRouterScrollBehavior(
  source: RawRouterScrollBehavior,
): RouterScrollBehavior {
  if (source === 'top') {
    source = (to, from, savedPosition) => {
      return savedPosition || { top: 0, left: 0 };
    };
  }
  return source;
}

function extractMatchedBehaviors(route: RouteLocationNormalized) {
  const components = getRouteMatchedComponents(
    route,
  ) as ComponentCustomOptions[];
  const behaviors: RouterScrollBehavior[] = [];
  components.forEach(({ scrollBehavior }) => {
    if (scrollBehavior != null) {
      behaviors.push(resolveRawRouterScrollBehavior(scrollBehavior));
    }
  });
  return behaviors;
}

function findLastMatchedBehavior(
  route: RouteLocationNormalized,
): RouterScrollBehavior | undefined {
  const behaviors = extractMatchedBehaviors(route);
  return behaviors[behaviors.length - 1];
}

export function createScrollBehavior(): RouterScrollBehavior {
  const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
    // If the returned position is falsy or an empty object, will retain current scroll position
    let position: any = false;
    const isRouteChanged = to !== from;

    // savedPosition is only available for popstate navigations (back button)
    if (savedPosition) {
      position = savedPosition;
    } else if (isRouteChanged) {
      const matchedBehavior =
        findLastMatchedBehavior(to) || resolveRawRouterScrollBehavior('top');
      position = matchedBehavior(to, from, savedPosition);
    } else if (to.path === from.path && to.hash !== from.hash) {
      // nextTick(() => nuxt.$emit('triggerScroll'));
    }

    return getSuspenseRouteBucket()
      .ensureReady()
      .then(async () => {
        // coords will be used if no selector is provided,
        // or if the selector didn't match any element.
        if (to.hash) {
          let hash = to.hash;
          // CSS.escape() is not supported with IE and Edge.
          if (
            typeof window.CSS !== 'undefined' &&
            typeof window.CSS.escape !== 'undefined'
          ) {
            hash = '#' + window.CSS.escape(hash.substr(1));
          }
          try {
            const el = document.querySelector(hash);
            if (el) {
              // scroll to anchor by returning the selector
              position = { el: hash };
              // Respect any scroll-margin-top set in CSS when scrolling to anchor
              // const _scrollMarginTop = getComputedStyle(el).scrollMarginTop;
              // if (_scrollMarginTop != null) {
              //   position.behavior =
              // }
              // const y = Number(getComputedStyle(el)['scroll-margin-top']?.replace('px', ''))
              // if (y) {
              //   position.offset = { y }
              // }
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(
              'Failed to save scroll position. Please add CSS.escape() polyfill (https://github.com/mathiasbynens/CSS.escape).',
            );
          }
        }

        return ScrollBehaviorMessenger.reserveNextPosition(position);
      });
  };
  return scrollBehavior;
}

import {
  defineComponent,
  VNode,
  Transition,
  // Suspense,
  ref,
  computed,
  h,
} from 'vue';
import {
  RouterView,
  RouteLocationNormalizedLoaded,
  // useRoute,
} from 'vue-router';
import { generateWatchQueryKey } from '../schemes';
// import { useVuePageControl } from '../injections';

const DEFAULT_TRANSITION = 'page';

export const VPage = defineComponent({
  name: 'VPage',
  setup() {
    // const pageControl = useVuePageControl();
    const currentComponent = ref<VNode | null>(null);

    const transition = computed(() => {
      const vnode = currentComponent.value;
      if (!vnode) return DEFAULT_TRANSITION;
      return DEFAULT_TRANSITION;
    });

    // const route = useRoute();

    /**
     * @TODO
     */
    // function onSuspensePending(Component: VNode) {
    //   currentComponent.value = Component;
    //   pageControl.onSuspensePending(Component);
    // }

    // function onSuspenseResolved(Component: VNode) {
    //   pageControl.onSuspenseResolved(Component);
    // }

    return () => {
      return (
        <RouterView
          v-slots={{
            default: ({
              Component,
              route,
            }: {
              Component: VNode;
              route: RouteLocationNormalizedLoaded;
            }) => {
              const key = generateWatchQueryKey(route, Component);

              return [
                <Transition name={transition.value} mode="out-in">
                  {Component ? h(Component, { key }) : undefined}
                  {/* <Suspense
                    onPending={() => onSuspensePending(Component)}
                    onResolve={() => onSuspenseResolved(Component)}
                    v-slots={{
                      default: () =>
                        Component
                          ? // ? h(Component, { key: route.path })
                            h(Component)
                          : undefined,
                    }}
                  /> */}
                </Transition>,
              ];
            },
          }}
        />
      );
    };
  },
});

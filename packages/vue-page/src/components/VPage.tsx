import {
  defineComponent,
  VNode,
  Transition,
  // Suspense,
  ref,
  computed,
  h,
  // KeepAlive,
  PropType,
} from 'vue';
import { RouterView } from 'vue-router';
import { RouterViewSlotProps, VuePageKeyOverride } from '../schemes';
import {
  generateRouteKeyWithWatchQuery,
  consumeForcePrefetchStates,
} from '../utils';
import { ScrollBehaviorMessenger } from '../composables';
// import { IN_WINDOW } from '@fastkit/helpers';
// import { useVuePageControl } from '../injections';

const DEFAULT_TRANSITION = 'page';

export const VPage = defineComponent({
  name: 'VPage',
  props: {
    pageKey: {
      type: [Function, String] as PropType<VuePageKeyOverride>,
      default: null,
    },
  },
  setup(props) {
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
            default: (routeProps: RouterViewSlotProps) => {
              const { Component } = routeProps;
              let key = generateRouteKeyWithWatchQuery(
                routeProps,
                props.pageKey,
              );

              if (consumeForcePrefetchStates(key)) {
                key = `${key}:${Date.now()}`;
              }

              return [
                <Transition
                  name={transition.value}
                  mode="out-in"
                  onEnter={(ev) => {
                    ScrollBehaviorMessenger.trigger();
                  }}
                  onEnterCancelled={() => {
                    ScrollBehaviorMessenger.release();
                  }}>
                  {Component ? h(Component, { key }) : undefined}
                  {/* {wrapInKeepAlive(
                    true,
                    Component ? h(Component, { key }) : undefined,
                  )} */}
                  {/* <KeepAlive>
                    {Component ? h(Component, { key }) : undefined}
                  </KeepAlive> */}
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

import {
  defineComponent,
  inject,
  VNode,
  Transition,
  ref,
  computed,
  h,
  PropType,
} from 'vue';
import { RouterView } from 'vue-router';
import { withCtx } from '@fastkit/vue-utils';
import { RouterViewSlotProps, VuePageKeyOverride } from '../schema';
import { generateRouteKeyWithWatchQuery } from '../utils';
import { ScrollBehaviorMessenger } from '../composables';
import { VuePageControlInjectionKey } from '../injections';

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
    // The control owns the force-prefetch flags. `VPage` has never required
    // one -- it renders fine on its own -- so inject without demanding it and
    // simply skip the remount path when there is none to read from.
    const pageControl = inject(VuePageControlInjectionKey, null);
    const currentComponent = ref<VNode | null>(null);

    const transition = computed(() => {
      const vnode = currentComponent.value;
      if (!vnode) return DEFAULT_TRANSITION;
      return DEFAULT_TRANSITION;
    });

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

    return () => (
      <RouterView
        v-slots={{
          default: withCtx((routeProps: RouterViewSlotProps) => {
            const { Component } = routeProps;
            let key = generateRouteKeyWithWatchQuery(routeProps, props.pageKey);

            if (pageControl?._consumeForcePrefetch(key)) {
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
          }),
        }}
      />
    );
  },
});

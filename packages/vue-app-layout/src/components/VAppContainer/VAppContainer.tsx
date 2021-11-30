import './VAppContainer.scss';

import {
  defineComponent,
  computed,
  InjectionKey,
  provide,
  inject,
  ComputedRef,
} from 'vue';

type VAppContainerState = 'padded' | 'pulled';

type VAppContainerProvideValue = ComputedRef<VAppContainerState>;

const VAppContainerInjectionKey: InjectionKey<VAppContainerProvideValue> =
  Symbol();

export const VAppContainer = defineComponent({
  name: 'VAppContainer',
  props: {
    pulled: Boolean,
  },
  setup(props, ctx) {
    const injectedParentState = inject(VAppContainerInjectionKey, null);
    const state = computed<{
      self?: VAppContainerState;
      inject: VAppContainerState;
    }>(() => {
      const parentState: VAppContainerState = injectedParentState
        ? injectedParentState.value
        : 'pulled';
      let myState: VAppContainerState | undefined;
      let myProvideState: VAppContainerState;
      if (props.pulled) {
        myProvideState = 'pulled';
        if (parentState === 'padded') {
          myState = 'pulled';
        }
      } else {
        myProvideState = 'padded';
        if (parentState === 'pulled') {
          myState = 'padded';
        }
      }
      return {
        self: myState,
        inject: myProvideState,
      };
    });
    const provideState = computed(() => state.value.inject);

    const classes = computed(() => {
      const classes = ['v-app-container'];
      const myState = state.value.self;
      myState && classes.push(`v-app-container--${myState}`);
      return classes;
    });

    provide(VAppContainerInjectionKey, provideState);

    return () => {
      return (
        <div class={classes.value}>
          <div>{JSON.stringify(state.value)}</div>
          <div class="v-app-container__inner">
            {ctx.slots.default && ctx.slots.default()}
          </div>
        </div>
      );
    };
  },
});

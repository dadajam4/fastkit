<script lang="ts">
import * as styles from './VAppContainer.css';

type VAppContainerState = 'padded' | 'pulled';

type VAppContainerProvideValue = ComputedRef<VAppContainerState>;

const VAppContainerInjectionKey: InjectionKey<VAppContainerProvideValue> =
  Symbol('VAppContainer');
</script>

<script lang="ts" setup>
import { computed, InjectionKey, provide, inject, ComputedRef } from 'vue';

defineOptions({
  name: 'VAppContainer',
});

const props = defineProps<{
  pulled?: boolean;
}>();

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
  const _classes = ['VAppContainer', styles.container];
  const myState = state.value.self;
  myState && _classes.push(styles.states[myState]);
  return _classes;
});

provide(VAppContainerInjectionKey, provideState);
</script>

<template>
  <div :class="classes">
    <div :class="styles.inner">
      <slot />
    </div>
  </div>
</template>

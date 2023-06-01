import { computed, ComputedRef } from 'vue';
import { IN_DOCUMENT } from '@fastkit/helpers';
import { V_STACK_CONTAINER_CLASS } from '../injections';

export function useTeleport(): ComputedRef<Element | undefined> {
  const teleportTarget = computed(() => {
    if (!IN_DOCUMENT) return undefined;

    const parent = document.body;

    let container = parent.querySelector(
      `:scope > .${V_STACK_CONTAINER_CLASS}`,
    );

    if (!container) {
      container = document.createElement('div');
      container.className = V_STACK_CONTAINER_CLASS;
      parent.appendChild(container);
    }

    return container;
  });

  return teleportTarget;
}

import { reactive } from 'vue';
import { createI18nObjectStorage } from '@fastkit/i18n';
import {
  extractRouteMatchedItems,
  isComponentCustomOptions,
} from '@fastkit/vue-utils';
import type { AnyProvider } from './provider';
import type { RouteLocationNormalized } from 'vue-router';

/**
 * Generate a reactive storage interface.
 * @returns Storage Interface
 */
export function createVueI18nObjectStorage() {
  return createI18nObjectStorage(reactive({}));
}

/**
 * Get the provider of the subspace set in the vue component
 * @param route - Normalized route object
 * @returns Provider of the subspace
 */
export function extractVueI18nComponentOptions(
  route: RouteLocationNormalized,
): AnyProvider[] {
  const results: AnyProvider[] = [];
  const items = extractRouteMatchedItems(route);
  items.forEach((item) => {
    const { Component } = item;
    if (!isComponentCustomOptions(Component)) return;
    const { i18n } = Component;
    if (i18n) {
      results.push(i18n);
    }
  });
  return results;
}

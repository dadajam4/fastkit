import { defineConfig } from 'vitest/config';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  // Shared config for every package's `vitest run` (each package resolves the
  // nearest config upward, which is this one). `@vitejs/plugin-vue-jsx`
  // transforms Vue JSX in `.tsx` sources; Vite 8 (rolldown) no longer handles it
  // transparently the way the previous esbuild pipeline did.
  plugins: [vueJsx()],
  test: {
    passWithNoTests: true,
  },
});

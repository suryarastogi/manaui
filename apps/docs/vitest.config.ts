import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = path.dirname(fileURLToPath(import.meta.url));

// A dedicated config keeps the test runner from loading vite.config.ts's
// React Router / Tailwind / MDX plugins.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(here, './app'),
      // Test against core's source, so no build step is needed first.
      '@manaui/core': path.resolve(here, '../../packages/core/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['app/**/*.test.ts', 'app/**/*.test.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
});

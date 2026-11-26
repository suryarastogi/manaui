import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

import { basePath } from './base-path.ts';

export default defineConfig({
  // GitHub Pages serves a project site from /<repo>/.
  base: basePath,
  plugins: [fumadocsMdx(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});

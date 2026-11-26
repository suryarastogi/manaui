import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

import { basePath } from './base-path.ts';

const getUrl = createGetUrl('/docs');

export default {
  // Fully static: every page is prerendered and served by GitHub Pages.
  ssr: false,
  basename: basePath,
  async prerender({ getStaticPaths }) {
    const paths: string[] = [...getStaticPaths()];

    for await (const entry of glob('**/*.{md,mdx}', { cwd: 'content/docs' })) {
      paths.push(getUrl(getSlugs(entry)));
    }

    return paths;
  },
} satisfies Config;

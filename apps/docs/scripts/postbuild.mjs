/**
 * Reshape `react-router build` output into what GitHub Pages serves.
 *
 * React Router writes prerendered pages under build/client/<basename>/ and
 * the SPA fallback at build/client/index.html, while assets (emitted by
 * Vite) and public/ files sit at build/client/. Pages mounts the uploaded
 * directory AT the base path, so everything has to live at one level:
 *
 *   build/client/index.html           -> 404.html   (SPA fallback for unknown URLs)
 *   build/client/<basename>/**        -> build/client/**
 */
import { cp, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const out = path.resolve('build/client');
const raw = process.env.BASE_PATH ?? '/manaui/';
const base = raw.replace(/^\/+|\/+$/g, '');

if (base) {
  const nested = path.join(out, base);
  if (!existsSync(nested)) {
    throw new Error(`postbuild: expected prerendered pages in ${nested}`);
  }
  // The fallback must move first: the prerendered home page takes its name.
  await rename(path.join(out, 'index.html'), path.join(out, '404.html'));
  for (const entry of await readdir(nested)) {
    await cp(path.join(nested, entry), path.join(out, entry), { recursive: true });
  }
  await rm(nested, { recursive: true });
} else {
  await cp(path.join(out, '__spa-fallback.html'), path.join(out, '404.html')).catch(() => {});
}

// Pages runs Jekyll by default, which would drop files it doesn't like.
await writeFile(path.join(out, '.nojekyll'), '');

console.log(`postbuild: build/client is ready to serve at /${base}${base ? '/' : ''}`);

/**
 * Serve build/client the way GitHub Pages does: mounted at the base path,
 * directory URLs resolve to index.html, unknown URLs get 404.html.
 *
 *   npm run preview -w docs            # http://localhost:4173/manaui/
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('build/client');
const raw = process.env.BASE_PATH ?? '/manaui/';
const base = `/${raw.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.data': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

async function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const target = path.resolve(root, rel);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  for (const candidate of [target, path.join(target, 'index.html')]) {
    const info = await stat(candidate).catch(() => null);
    if (info?.isFile()) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (base && pathname !== base && !pathname.startsWith(`${base}/`)) {
    res.writeHead(302, { location: `${base}/` }).end();
    return;
  }
  const file = await resolveFile(pathname.slice(base.length) || '/');
  const served = file ?? path.join(root, '404.html');
  const body = await readFile(served).catch(() => null);
  if (!body) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(file ? 200 : 404, {
    'content-type': TYPES[path.extname(served)] ?? 'application/octet-stream',
    'access-control-allow-origin': '*',
  });
  res.end(body);
}).listen(port, () => {
  console.log(`preview: http://localhost:${port}${base}/`);
});

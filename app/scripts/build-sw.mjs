import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) result.push(...await walk(p)); else result.push(p);
  }
  return result;
}
const files = (await walk('dist')).filter(p => !p.endsWith('/sw.js')).sort();
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(file));
const assets = files.map(p => './' + p.slice(5));
const code = `
const CACHE = 'fernanda-plano-${hash.digest('hex').slice(0, 16)}';
const ASSETS = ${JSON.stringify(assets)};
const ROOT = new URL('./', self.location.href).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('fernanda-plano-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.href.startsWith(ROOT) || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') return (await cache.match(new URL('index.html', ROOT).href)) || fetch(event.request);
    return (await cache.match(event.request)) || fetch(event.request);
  })());
});
`;
await writeFile('dist/sw.js', code);
await writeFile('dist/.nojekyll', '');
console.log(`PWA: ${assets.length} arquivos no cache offline.`);

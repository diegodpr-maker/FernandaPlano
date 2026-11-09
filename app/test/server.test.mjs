import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server.mjs';
test('servidor entrega app, manifesto, SW e saúde; rejeita métodos e arquivos ausentes', async () => {
  process.env.DB_PATH=':memory:';
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for(const route of ['/', '/manifest.webmanifest', '/sw.js', '/icon-192.png']) {
      const r=await fetch(base+route); assert.equal(r.status,200,route); assert.ok((await r.arrayBuffer()).byteLength>0);
    }
    assert.equal((await (await fetch(base+'/api/health')).json()).status,'ok');
    assert.equal((await fetch(base+'/missing.js')).status,404);
    assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
    assert.equal((await fetch(base+'/sw.js')).headers.get('cache-control'),'no-cache');
  } finally { await new Promise(resolve=>server.close(resolve)); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
test('service worker pré-carrega todos os arquivos e abre navegação sem rede',async()=>{
 const events={}, entries=new Map(); let network=0;
 const scope='https://example.test/FernandaPlano/';
 const cache={async addAll(paths){for(const p of paths){const bytes=await fs.readFile('dist/'+p.slice(2));entries.set(new URL(p,scope).href,new Response(bytes));}},async match(key){return entries.get(typeof key==='string'?key:key.url)?.clone();}};
 const context={URL, self:{location:new URL(scope+'sw.js'),clients:{claim:async()=>{}},addEventListener:(event,fn)=>events[event]=fn}, caches:{open:async()=>cache,keys:async()=>[],delete:async()=>true}, fetch:async()=>{network++;throw Error('offline');}};
 vm.runInNewContext(await fs.readFile('dist/sw.js','utf8'), context);
 let task; events.install({waitUntil:p=>task=p}); await task;
 assert.ok(entries.size>=8);
 events.fetch({request:{url:scope,method:'GET',mode:'navigate'},respondWith:p=>task=p});
 assert.match(await (await task).text(),/Plano de Residência da Fernanda/);
 for(const url of entries.keys()){events.fetch({request:{url,method:'GET',mode:'cors'},respondWith:p=>task=p}); assert.ok(await task);}
 assert.equal(network,0);
});

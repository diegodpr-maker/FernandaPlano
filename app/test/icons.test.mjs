import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
test('manifesto mantém identidade do PWA e fornece PNGs reais para instalação e atalhos',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/manifest.webmanifest','utf8'));
 assert.equal(manifest.id,'./');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 assert.equal(manifest.display,'standalone');
 assert.ok(manifest.icons.some(i=>i.purpose==='maskable'&&i.sizes==='512x512'));
 const images=[...manifest.icons.map(i=>[i.src,Number(i.sizes.split('x')[0])]),['apple-touch-icon.png',180],['favicon-32.png',32]];
 for(const [name,size] of images){
  const data=await fs.readFile('public/'+name);
  assert.equal(data.subarray(1,4).toString(),'PNG',name);
  assert.equal(data.readUInt32BE(16),size,name);assert.equal(data.readUInt32BE(20),size,name);
  assert.ok([2,3].includes(data[25]),name+' deve ser opaco');
  for(let offset=8;offset<data.length;){const length=data.readUInt32BE(offset);assert.notEqual(data.subarray(offset+4,offset+8).toString(),'tRNS',name+' não deve ter transparência');offset+=12+length;}
 }
 const html=await fs.readFile('index.html','utf8');
 assert.match(html,/apple-touch-icon\.png/);assert.match(html,/favicon-32\.png/);
});

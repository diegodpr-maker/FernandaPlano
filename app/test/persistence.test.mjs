import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { parseBackup } from '../src/persistence.js';
const sample=()=>({S:{v:4,start:'2026-11-09',topics:[{id:'CM01',n:'Tema',ck:{}}],plan:[{k:'deep',r:[]}]},LOGS:[{d:'2026-11-07',t:20,c:15}]});
test('valida backups antigos e rejeita formatos capazes de quebrar o progresso',()=>{
 assert.deepEqual(parseBackup(JSON.stringify(sample())),sample());
 for(const edit of [o=>o.S.topics={},o=>o.S.plan=[],o=>o.S.imgs={},o=>o.LOGS={},o=>o.LOGS[0].d=null,o=>o.LOGS[0].c=21,o=>o.IMGS={x:'javascript:alert(1)'}]){const data=sample();edit(data);assert.throws(()=>parseBackup(JSON.stringify(data)));}
});
const source=await fs.readFile(new URL('../src/engine.js',import.meta.url),'utf8');
function runtime(){
 let fail=false;const writes=[];const storage=new Map();
 const ctx=vm.createContext({console:{error(){}},parseBackup,EXAM_PADRAO:'2027-09-12',document:{getElementById(){return {}}},setTimeout(){return 1},clearTimeout(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},localDB:{async save(data){if(fail)throw Error('quota');writes.push(structuredClone(data));}},closeModal(){},render(){},toast(){}});
 vm.runInContext('let S='+JSON.stringify(sample().S)+';let LOGS='+JSON.stringify(sample().LOGS)+';'+source.slice(source.indexOf("let MODE='local'"),source.indexOf('async function loadAll()')),ctx);
 return {ctx,writes,fail(value){fail=value}};
}
test('falha no SQLite mantém alterações pendentes e permite repetir a gravação',async()=>{
 const r=runtime();r.fail(true);vm.runInContext("touch('state','logs_2026-11')",r.ctx);
 await assert.rejects(vm.runInContext('flush()',r.ctx));assert.equal(vm.runInContext('dirty.size',r.ctx),2);
 r.fail(false);await vm.runInContext('flush()',r.ctx);assert.equal(r.writes[0].LOGS[0].c,15);assert.equal(vm.runInContext('dirty.size',r.ctx),0);
});
test('falha ao gravar imagem preserva imagem anterior e não deixa imagem fantasma',async()=>{
 const r=runtime();await vm.runInContext("putImg('original','data:image/png;base64,AAA')",r.ctx);r.fail(true);
 await assert.rejects(vm.runInContext("putImg('nova','data:image/png;base64,BBB')",r.ctx));assert.equal(vm.runInContext("IMGC.has('nova')",r.ctx),false);
 await assert.rejects(vm.runInContext("putImg('original','data:image/png;base64,CCC')",r.ctx));assert.equal(await vm.runInContext("getImg('original')",r.ctx),'data:image/png;base64,AAA');
});
test('restauração mantém imagens carregadas do SQLite e falha sem substituir estado',async()=>{
 const r=runtime();await vm.runInContext("putImg('original','data:image/png;base64,AAA')",r.ctx);
 vm.runInContext(source.slice(source.indexOf('async function restoreFrom(txt)'),source.indexOf("document.addEventListener('click',ev=>{",source.indexOf('async function restoreFrom(txt)'))),r.ctx);
 const data=sample();data.S.imgs=[{id:'original'}];r.ctx.backup=JSON.stringify(data);await vm.runInContext('restoreFrom(backup)',r.ctx);
 assert.equal(vm.runInContext('S.imgs[0].id',r.ctx),'original');assert.equal(vm.runInContext('LOGS[0].c',r.ctx),15);
 data.LOGS[0].c=1;r.ctx.backup=JSON.stringify(data);r.fail(true);await vm.runInContext('restoreFrom(backup)',r.ctx);assert.equal(vm.runInContext('LOGS[0].c',r.ctx),15);
});

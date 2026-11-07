import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { parseBackup } from '../src/persistence.js';
const sample = () => ({S:{start:'2026-11-09',topics:[{id:'CM01',n:'Tema',ck:{}}],plan:[{k:'deep',r:[]}]},LOGS:[{d:'2026-11-07',t:20,c:15}]});
test('valida backups antigos e rejeita formatos capazes de quebrar o progresso', () => {
  assert.deepEqual(parseBackup(JSON.stringify(sample())),sample());
  for (const edit of [o=>o.S.topics={},o=>o.S.plan=[],o=>o.S.imgs={},o=>o.LOGS={},o=>o.LOGS[0].d=null,o=>o.LOGS[0].c=21,o=>o.IMGS={x:'javascript:alert(1)'}]) {
    const data=sample();edit(data);assert.throws(()=>parseBackup(JSON.stringify(data)));
  }
});
const source=await fs.readFile(new URL('../src/engine.js',import.meta.url),'utf8');
function runtime() {
  const timers=[];const writes=[];let fail=true;
  const ctx=vm.createContext({console:{error(){}},document:{getElementById(){return {}}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},localStorage:{setItem(k,v){if(fail)throw Error('quota');writes.push(JSON.parse(v))}}});
  vm.runInContext("let S={logMonths:[]};let LOGS=[{d:'2026-11-07',t:10,c:8}];"+source.slice(source.indexOf("let MODE='local'"),source.indexOf('/* imagens */')),ctx);
  return {ctx,timers,writes,recover(){fail=false}};
}
test('repete gravação após falha de armazenamento sem perder as questões pendentes',async()=>{
  const r=runtime();vm.runInContext("touch('state','logs_2026-11')",r.ctx);
  await r.timers.shift()();
  assert.equal(vm.runInContext('dirty.size',r.ctx),2);
  assert.equal(r.timers.length,1);
  r.recover();await r.timers.shift()();
  assert.equal(r.writes[0].LOGS[0].c,8);
  assert.equal(vm.runInContext('dirty.size',r.ctx),0);
});
test('falha remota mantém todos os meses pendentes para nova tentativa',async()=>{
  const r=runtime();vm.runInContext("MODE='cloud';COL={doc(){return {async set(){throw Error('offline')}}}};touch('state','logs_2026-11')",r.ctx);
  await r.timers.shift()();assert.equal(vm.runInContext('dirty.size',r.ctx),2);
});

import { IDBFactory } from 'fake-indexeddb';
function imageRuntime() {
  const ctx=vm.createContext({indexedDB:new IDBFactory(),Map,Promise,Error,MODE:'local',COL:null});
  vm.runInContext(source.slice(source.indexOf('const IMGC=new Map()'),source.indexOf('async function loadAll()')),ctx);
  return ctx;
}
test('imagem só entra no cache após confirmação da gravação; abortar não deixa imagem fantasma',async()=>{
  const ctx=imageRuntime();
  await vm.runInContext("putImg('original','data:image/png;base64,AAA')",ctx);
  vm.runInContext('IMGC.clear()',ctx);
  assert.equal(await vm.runInContext("getImg('original')",ctx),'data:image/png;base64,AAA');
  vm.runInContext("idbOp=async()=>{throw Error('quota')}",ctx);
  await assert.rejects(vm.runInContext("putImg('nova','data:image/png;base64,BBB')",ctx));
  assert.equal(vm.runInContext("IMGC.has('nova')",ctx),false);
});
test('transação de imagens cancelada rejeita e preserva os dados anteriores',async()=>{
  const ctx=imageRuntime();
  await vm.runInContext("putImg('original','data:image/png;base64,AAA')",ctx);
  await assert.rejects(vm.runInContext("idbOp('readwrite',store=>{store.put('alterada','original');store.transaction.abort()})",ctx));
  vm.runInContext('IMGC.clear()',ctx);
  assert.equal(await vm.runInContext("getImg('original')",ctx),'data:image/png;base64,AAA');
});
test('restaurar texto mantém imagem persistida que ainda não foi aberta nesta sessão',async()=>{
  const ctx=imageRuntime();
  Object.assign(ctx,{parseBackup,EXAM_PADRAO:'2027-09-12',migratePlan(){},touch(){},closeModal(){},render(){},async flush(){},toast(){},dirty:new Set()});
  vm.runInContext('let S=null;let LOGS=[];'+source.slice(source.indexOf('async function restoreFrom(txt)'),source.indexOf("document.addEventListener('click',ev=>{",source.indexOf('async function restoreFrom(txt)'))),ctx);
  await vm.runInContext("putImg('original','data:image/png;base64,AAA')",ctx);
  vm.runInContext('IMGC.clear()',ctx);
  const data=sample();data.S.imgs=[{id:'original'}];ctx.backup=JSON.stringify(data);
  await vm.runInContext('restoreFrom(backup)',ctx);
  assert.equal(vm.runInContext('S.imgs[0].id',ctx),'original');
  assert.equal(vm.runInContext('LOGS[0].c',ctx),15);
  assert.ok(vm.runInContext('Array.isArray(S.caderno)',ctx));
});

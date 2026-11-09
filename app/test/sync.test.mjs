import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase } from '../node-db.mjs';
import { handleApi } from '../api.mjs';

test('SQLite online: autenticação, gravação, reabertura, conflitos e reenvio idempotente',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'fernanda-test-'));
 let db=openDatabase(path.join(directory,'db.sqlite'));
 const env={DB:db,APP_PASSWORD:'fixture-only',SESSION_SECRET:'fixture-secret-not-production'};
 let cookie='';
 async function request(route,body,authenticated=true){const headers={'Content-Type':'application/json'};if(authenticated)headers.cookie=cookie;return handleApi(new Request('https://example.test'+route,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{})}),env);}
 try{
  assert.equal((await request('/api/sync')).status,401);
  assert.equal((await request('/api/login',{password:'wrong'})).status,401);
  const login=await request('/api/login',{password:'fixture-only'});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
  const payload={S:{topics:[{id:'a'}],plan:[]},LOGS:[{id:'log-1',t:20,c:15}],IMGS:{img:'data:image/png;base64,'+'a'.repeat(450000)}};
  const sent={base:0,mutationId:'mutation-0000000001',payload};
  const first=await (await request('/api/sync',sent)).json();assert.equal(first.revision,1);
  assert.equal((await (await request('/api/sync',sent)).json()).revision,1);
  db.close();db=openDatabase(path.join(directory,'db.sqlite'));env.DB=db;
  const downloaded=await (await request('/api/sync')).json();assert.deepEqual(downloaded.payload,payload);
  const conflict=await request('/api/sync',{...sent,mutationId:'mutation-0000000002'});assert.equal(conflict.status,409);
  assert.deepEqual((await conflict.json()).remote.payload,payload);
  const update=await request('/api/sync',{base:1,mutationId:'mutation-0000000003',payload:{...payload,LOGS:[]}});assert.equal((await update.json()).revision,2);
  assert.deepEqual((await (await request('/api/sync')).json()).payload.LOGS,[]);
  const csrf=await handleApi(new Request('https://example.test/api/sync',{headers:{cookie,origin:'https://other.test'}}),env);assert.equal(csrf.status,403);
 }finally{db.close();await rm(directory,{recursive:true,force:true});}
});

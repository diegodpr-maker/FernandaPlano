import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let SQL;
let queue=Promise.resolve();
let generation=null;
function openIDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('fr_sqlite_v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function readFile(){const idb=await openIDB();return new Promise((resolve,reject)=>{const tx=idb.transaction('files','readonly');const r=tx.objectStore('files').get('database');tx.oncomplete=()=>{idb.close();resolve(r.result)};tx.onerror=()=>{idb.close();reject(tx.error)};});}
async function writeFile(bytes,expected){const idb=await openIDB();return new Promise((resolve,reject)=>{const tx=idb.transaction('files','readwrite');const store=tx.objectStore('files');const r=store.get('database');let conflict=false;r.onsuccess=()=>{if((r.result?.generation||0)!==expected){conflict=true;tx.abort();return;}store.put({bytes,generation:expected+1},'database');};tx.oncomplete=()=>{idb.close();resolve(expected+1)};tx.onabort=tx.onerror=()=>{idb.close();reject(new Error(conflict?'Outra aba alterou o banco. Exporte um backup antes de recarregar.': 'Falha ao gravar SQLite neste aparelho.'));};});}
async function loadDB(){
 SQL ||= await initSqlJs({wasmBinary:new Uint8Array(await (await fetch(wasmUrl)).arrayBuffer())});
 const file=await readFile();
 const db=new SQL.Database(file?.bytes);
 db.run('CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 return {db,generation:file?.generation||0};
}
function read(db,key,fallback=null){const r=db.exec('SELECT value FROM records WHERE key=?',[key]);return r.length?JSON.parse(r[0].values[0][0]):fallback;}
function put(db,key,value){db.run('INSERT OR REPLACE INTO records VALUES(?,?)',[key,JSON.stringify(value)]);}
function transaction(fn){const task=queue.then(async()=>{const current=await loadDB();try{const result=await fn(current.db,current.generation);if(result?.write){generation=await writeFile(current.db.export(),current.generation);}else if(generation===null)generation=current.generation;return result?.value;}finally{current.db.close();}});queue=task.catch(()=>{});return task;}
export const localDB={
 async load(){return transaction((db,g)=>{if(generation!==null&&generation!==g)throw Error('Outra aba alterou o banco. Exporte um backup e recarregue.');return {value:{payload:read(db,'payload'),sync:read(db,'sync',{revision:0,dirty:false}),generation:g}};});},
 async save(payload){return transaction((db,g)=>{if(generation!==null&&generation!==g)throw Error('Outra aba alterou o plano. Exporte um backup e recarregue.');put(db,'payload',payload);const sync=read(db,'sync',{revision:0});put(db,'sync',{...sync,dirty:true,mutationId:crypto.randomUUID()});return {write:true};});},
 async acknowledge(sentGeneration,revision){return transaction((db,g)=>{if(generation!==g)throw Error('Outra aba alterou o banco durante a sincronização. Recarregue.');const s=read(db,'sync',{});put(db,'sync',{...s,revision,dirty:g!==sentGeneration});return {write:true};});},
 async applyRemote(remote,expected){return transaction((db,g)=>{if(g!==expected)return {value:false};const old=read(db,'payload');if(old)put(db,'conflictBackup',old);put(db,'payload',remote.payload);put(db,'sync',{revision:remote.revision,dirty:false});return {write:true,value:true};});},
 async rebase(revision){return transaction(db=>{put(db,'sync',{revision,dirty:true,mutationId:crypto.randomUUID()});return {write:true};});},
 async conflictBackup(){return transaction(db=>({value:read(db,'conflictBackup')}));},
 async exportFile(){await queue;const f=await readFile();return f?.bytes;}
};

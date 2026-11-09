import { localDB } from './local-db.js';
let hooks={flush:async()=>{},apply:()=>{}};
let running=null;
let conflict=null;
const listeners=new Set();
let state={message:'SQLite local · aguardando sincronização',conflict:false};
function report(message,extra={}){state={message,conflict:false,...extra};for(const listener of listeners)listener(state);}
export function subscribeSync(fn){listeners.add(fn);fn(state);return()=>listeners.delete(fn);}
export function registerSyncHooks(value){hooks=value;}
async function api(url,options){const r=await fetch(url,{...options,credentials:'same-origin',signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok)throw Object.assign(Error(data.error||'Falha de sincronização'),{status:r.status,data});return data;}
export async function syncNow(){
 if(running)return running;
 running=(async()=>{
  try{
   try{await hooks.flush();}catch{report('Falha ao gravar no aparelho. Exporte um backup antes de fechar.');return;}
   const local=await localDB.load();
   report('Sincronizando…');
   if(local.sync.dirty && local.payload){
    const saved=await api('/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({base:local.sync.revision||0,mutationId:local.sync.mutationId,payload:local.payload})});
    await localDB.acknowledge(local.generation,saved.revision);
    report('Gravado no SQLite online e neste aparelho');
   }else{
    const remote=await api('/api/sync');
    if(remote.payload&&remote.revision!==local.sync.revision){
     await hooks.flush();
     if(await localDB.applyRemote(remote,local.generation)){hooks.apply(remote.payload);report('Dados online atualizados no SQLite deste aparelho');}
     else report('Alterações locais pendentes; sincronize novamente');
    }else report('SQLite online e offline atualizados');
   }
  }catch(e){
   if(e.status===409){conflict=e.data.remote;report('Há alterações diferentes neste aparelho e no servidor.',{conflict:true});}
   else if(e.status===401)report('Salvo offline · entre novamente para sincronizar');
   else report(navigator.onLine ? `Salvo offline · ${e.message}` : 'Salvo offline · sincroniza quando a conexão voltar');
  }finally{running=null;}
 })();return running;
}
export async function resolveConflict(choice){
 if(!conflict)return;
 await hooks.flush();
 const local=await localDB.load();
 if(choice==='online'){
  // Export before replacing, in addition to the retained SQLite backup.
  downloadBackup(local.payload,'backup-antes-de-atualizar');
  if(await localDB.applyRemote(conflict,local.generation))hooks.apply(conflict.payload);
 }else{
  downloadBackup(conflict.payload,'backup-versao-online');
  await localDB.rebase(conflict.revision);
 }
 conflict=null;await syncNow();
}
export function downloadBackup(payload,name='backup-plano-fernanda'){
 if(!payload)return;
 const blob=new Blob([JSON.stringify({app:'plano-fernanda',v:2,...payload})],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

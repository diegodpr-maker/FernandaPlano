const encoder = new TextEncoder();
const json = (value,status=200,headers={}) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const hex = bytes => Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
async function digest(s){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));}
async function sign(text,secret){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(text)));}
function equal(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
async function authorized(request,env){
 const token=request.headers.get('cookie')?.match(/(?:^|;\s*)fernanda_session=([^;]+)/)?.[1];
 if(!token)return false;
 const [expires,signature]=token.split('.');
 return Number(expires)>Date.now() && signature && equal(await sign(expires,env.SESSION_SECRET),signature);
}
export async function readSnapshot(db){
 const head=await db.prepare('SELECT id,revision,created_at FROM snapshots ORDER BY revision DESC LIMIT 1').first();
 if(!head)return {revision:0,payload:null};
 const {results}=await db.prepare('SELECT body FROM snapshot_parts WHERE id=? ORDER BY part').bind(head.id).all();
 return {revision:head.revision,mutationId:head.id,updatedAt:head.created_at,payload:JSON.parse(results.map(r=>r.body).join(''))};
}
export async function writeSnapshot(db,{base,mutationId,payload}){
 const prior=await db.prepare('SELECT revision FROM snapshots WHERE id=?').bind(mutationId).first();
 if(prior)return {revision:prior.revision,mutationId};
 const body=JSON.stringify(payload);
 const queries=[db.prepare('INSERT OR IGNORE INTO snapshots(id,revision,created_at) SELECT ?,COALESCE(MAX(revision),0)+1,? FROM snapshots HAVING COALESCE(MAX(revision),0)=?').bind(mutationId,Date.now(),base)];
 for(let i=0;i<body.length;i+=200000)queries.push(db.prepare('INSERT OR IGNORE INTO snapshot_parts(id,part,body) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM snapshots WHERE id=?)').bind(mutationId,i/200000,body.slice(i,i+200000),mutationId));
 await db.batch(queries);
 const saved=await db.prepare('SELECT revision FROM snapshots WHERE id=?').bind(mutationId).first();
 return saved ? {revision:saved.revision,mutationId} : null;
}
export async function handleApi(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/api/health')return json({status:'ok',app:'FernandaPlano',sqlite:!!env.DB});
 if(!env.DB||!env.APP_PASSWORD||!env.SESSION_SECRET)return json({error:'Servidor de sincronização não configurado.'},503);
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin)return json({error:'Origem não permitida.'},403);
 if(path==='/api/login' && request.method==='POST'){
  const key=await digest(request.headers.get('cf-connecting-ip')||'local');
  const now=Date.now();
  await env.DB.prepare('INSERT INTO login_attempts(id,count,started) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN started<? THEN 1 ELSE count+1 END,started=CASE WHEN started<? THEN ? ELSE started END').bind(key,now,now-900000,now-900000,now).run();
  const attempts=await env.DB.prepare('SELECT count FROM login_attempts WHERE id=?').bind(key).first();
  if(attempts.count>10)return json({error:'Muitas tentativas. Aguarde 15 minutos.'},429);
  const input=await request.json().catch(()=>({}));
  if(typeof input.password!=='string'||!equal(await digest(input.password),await digest(env.APP_PASSWORD)))return json({error:'Senha incorreta.'},401);
  await env.DB.prepare('DELETE FROM login_attempts WHERE id=?').bind(key).run();
  const expires=String(now+86400000);
  const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
  return json({ok:true},200,{'Set-Cookie':`fernanda_session=${expires}.${await sign(expires,env.SESSION_SECRET)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`});
 }
 if(!await authorized(request,env))return json({error:'Entre novamente para sincronizar.'},401);
 if(path==='/api/logout' && request.method==='POST')return json({ok:true},200,{'Set-Cookie':'fernanda_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
 if(path==='/api/sync' && request.method==='GET')return json(await readSnapshot(env.DB));
 if(path==='/api/sync' && request.method==='POST'){
  const body=await request.text();
  if(body.length>20*1024*1024)return json({error:'Backup acima de 20 MB. Exporte uma cópia e reduza as imagens para sincronizar.'},413);
  let input;try{input=JSON.parse(body);}catch{return json({error:'JSON inválido.'},400);}
  if(!Number.isSafeInteger(input.base)||input.base<0||!/^[-\w]{16,80}$/.test(input.mutationId||'')||!Array.isArray(input.payload?.S?.topics)||!Array.isArray(input.payload?.S?.plan)||!Array.isArray(input.payload?.LOGS))return json({error:'Dados inválidos.'},400);
  const result=await writeSnapshot(env.DB,input);
  return result ? json(result) : json({error:'Há alterações em outro aparelho.',remote:await readSnapshot(env.DB)},409);
 }
 return json({error:'Rota não encontrada.'},404);
}

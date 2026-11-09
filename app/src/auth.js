const KEY='fr_offline_auth_v1';
async function derive(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:210000,salt:new Uint8Array(salt)},key,256);return Array.from(new Uint8Array(bits)).join(',');}
export async function unlock(password){
 let response;
 try{response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password}),credentials:'same-origin',signal:AbortSignal.timeout(10000)});}catch{}
 if(response?.ok){
  const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
  localStorage.setItem(KEY,JSON.stringify({salt,verifier:await derive(password,salt)}));
  return {online:true};
 }
 if(response && [401,429].includes(response.status)){const e=await response.json();throw Error(e.error);}
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved && await derive(password,saved.salt)===saved.verifier)return {online:false};
 throw Error(saved?'Senha incorreta ou servidor indisponível.':'Para o primeiro acesso neste aparelho, abra a versão online com internet.');
}

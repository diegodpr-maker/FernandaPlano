import fs from 'node:fs';
import path from 'node:path';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
const files=Object.fromEntries(walk('dist').filter(p=>!p.includes('/server/')&&!p.includes('/.openai/')).map(p=>['/'+p.slice(5),{body:fs.readFileSync(p,'base64'),type:types[path.extname(p)]||'application/octet-stream'}]));
const api=fs.readFileSync('api.mjs','utf8');
const worker=api+'\nconst ASSETS='+JSON.stringify(files)+`;\nexport default {async fetch(request,env){try{const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return await handleApi(request,env);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const file=ASSETS[url.pathname==='/'?'/index.html':url.pathname];if(!file)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(file.body),c=>c.charCodeAt(0)),{headers:{'Content-Type':file.type,'Cache-Control':url.pathname.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache','X-Content-Type-Options':'nosniff'}});}catch(error){console.error('API error',error.message);return json({error:'Não foi possível concluir a operação. Seus dados locais continuam disponíveis.'},500);}}};`;
fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',worker);
console.log('Worker com '+Object.keys(files).length+' arquivos e API SQLite.');

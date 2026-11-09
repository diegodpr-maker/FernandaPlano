import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './node-db.mjs';
import { handleApi } from './api.mjs';
let db;
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
export const server = http.createServer(async (req, res) => {
  if(req.url.startsWith('/api/')){
    try{
      db ||= openDatabase(process.env.DB_PATH || './data/fernanda.sqlite');
      let body='';for await(const chunk of req){body+=chunk;if(body.length>21*1024*1024){res.writeHead(413);res.end();return;}}
      const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:{...req.headers,'cf-connecting-ip':req.socket.remoteAddress||'local'},...(!['GET','HEAD'].includes(req.method)?{body}: {})});
      const response=await handleApi(request,{DB:db,APP_PASSWORD:process.env.APP_PASSWORD,SESSION_SECRET:process.env.SESSION_SECRET});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    }catch{res.writeHead(500);res.end('Falha no servidor');}
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/health') { res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}); res.end(req.method === 'HEAD' ? undefined : JSON.stringify({status: 'ok', app: 'FernandaPlano'})); return; }
    const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': pathname.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); res.end('Não encontrado'); }
});
server.on('close',()=>{db?.close();db=undefined;});
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(Number(process.env.PORT || 3000), process.env.HOST || '0.0.0.0', () => console.log(`FernandaPlano: http://localhost:${server.address().port}`));
}

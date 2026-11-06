import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.env.STATIC_DIR || dirname(fileURLToPath(import.meta.url)));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.woff2':'font/woff2', '.ttf':'font/ttf', '.txt':'text/plain; charset=utf-8' };
const pages = new Set(['index.html','apps.js','hub.js','hub.css','premium.css','artwork.css','使用说明.txt']);
const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options','nosniff');
  response.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405,{Allow:'GET, HEAD'}).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if (pathname === '/health') { response.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(request.method==='HEAD'?undefined:'{"ok":true}'); return; }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = resolve(root,relative);
    if (!(pages.has(relative) || (relative.startsWith('assets/') && !relative.split('/').some(part=>part.startsWith('.')))) || !file.startsWith(root+sep) || !types[extname(file)]) { response.writeHead(404).end(); return; }
    const info = await stat(file);
    if(!info.isFile()) { response.writeHead(404).end(); return; }
    const etag = `W/"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`;
    response.setHeader('ETag',etag);
    response.setHeader('Cache-Control',relative.startsWith('assets/')?'public, max-age=300, must-revalidate':'no-cache');
    if(request.headers['if-none-match']===etag) { response.writeHead(304).end(); return; }
    response.writeHead(200,{'Content-Type':types[extname(file)],'Content-Length':info.size});
    if(request.method==='HEAD') response.end();
    else createReadStream(file).on('error',()=>response.destroy()).pipe(response);
  } catch(error) { response.writeHead(error instanceof URIError?400:404).end(); }
});
server.listen(Number(process.env.PORT || 8080),'0.0.0.0',()=>console.log(`Mike economics hub listening on port ${process.env.PORT || 8080}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));

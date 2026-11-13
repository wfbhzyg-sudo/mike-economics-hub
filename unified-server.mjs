import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createPortalAuth} from './auth/portal.mjs';
import {createHomework} from './homework-server/api.mjs';
import {safePath} from './auth/shared.mjs';
import {createTeacherGateway} from './teacher-server.mjs';
const auth=await createPortalAuth();
const homework=await createHomework({externalAuth:auth});
const teacherGateway=createTeacherGateway(auth);
const root=dirname(fileURLToPath(import.meta.url));
const pages=new Set(['index.html','login.html','login.css','login.js','portal-nav.js','apps.js','hub.js','hub.css','premium.css','mobile.css','courses.css','floating.css','motion.js','artwork.css','homework/index.html','homework/app.js','homework/grade-journey.js','homework/grade-heatmap.js','homework/grade-journey-model.js','homework/grade-journey.css','homework/score-bands.js','homework/view-memory.js','homework/correction-workspace.js','homework/flow.css','homework/form-feedback.js','homework/form-feedback.css','homework/workspace-ui.js','homework/workspace.css','homework/style.css','homework/nav.js','homework/learning-model.js','homework/learning-ui.js','homework/search-text.js','homework/assignment-roster.js','homework/pdf-reader.js','homework/review-studio.js','homework/review-gallery.js','homework/review-save.js','homework/review-studio.css']);
for(const file of ['index.html','app.js','style.css','workspace.css','homework.css','graphs.js','graph-projections.js'])pages.add('teacher/'+file);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.wasm':'application/wasm','.bcmap':'application/octet-stream','.pfb':'application/octet-stream'};
const publicAssets=new Set(['login.css','login.js','assets/mike-hub-mark.svg','assets/hub-serif-84bab7c8.woff2','assets/micro-v1-640-1ed9d14e.webp','assets/macro-v1-640-dba44291.webp','assets/maths-v1-640-f58ee996.webp','assets/scene-mobile-1db46873.webp','assets/econ-quest-logo-816e8870.webp','assets/teachers-34cadd1a.webp']);
for(const f of ['companion.js','companion.css','homework/choice-correction.js','homework/mcq.js','homework/mcq-import.js','homework/mcq.css'])pages.add(f);
for(const f of ['companion.js','companion.css','assets/mike-pixel.png'])publicAssets.add(f);
const compressed=new Map();
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
 try{
  const u=new URL(req.url,'http://local'),path=decodeURIComponent(u.pathname);
  if(path==='/health'){res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true,"mode":"unified-portal"}');return;}
  // This header only selects the canonical URL; authentication never trusts it.
  if(process.env.NODE_ENV==='production'&&['/','/login.html','/homework','/homework/','/teacher','/teacher/'].includes(path)&&req.headers.host!==new URL(auth.portalOrigin).host&&req.headers['x-mike-original-host']!==new URL(auth.portalOrigin).host){auth.redirect(res,auth.portalOrigin+safePath(req.url));return;}
  if(await auth.handle(req,res))return;
  if(await teacherGateway(req,res))return;
  if(await homework(req,res))return;
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  if(path.includes('\\')||path.includes('\0')||path.split('/').some(p=>p.startsWith('.'))){res.writeHead(404).end();return;}
  const signed=await auth.session(req);
  if(path==='/teacher'||path.startsWith('/teacher/')){
   if(process.env.TEACHER_WORKSPACE_ENABLED!=='1'){res.writeHead(404).end();return;}
   if(!signed){auth.redirect(res,'/?next='+encodeURIComponent(safePath(req.url)));return;}
   if(signed.role!=='teacher'){res.writeHead(403,{'Content-Type':'text/html; charset=utf-8'}).end('<!doctype html><html lang="zh-CN"><title>教师工作台</title><meta name="viewport" content="width=device-width"><body><h1>此页面仅供教师使用</h1><p>你的作业与学习记录仍保存在原入口。</p><a href="/">返回经济一页通</a></body></html>');return;}
  }
  if(path==='/enter/bookself'||path==='/enter/econquest'){const target=new URL('/sso/start',auth.coreOrigin);target.searchParams.set('next',path.endsWith('econquest')?'/quest/':'/');auth.redirect(res,target.href);return;}
  let relative=path==='/'?'index.html':path==='/homework'||path==='/homework/'?'homework/index.html':path.slice(1);
  if(path==='/teacher'||path==='/teacher/')relative='teacher/index.html';
  if(signed&&path==='/'&&u.searchParams.get('account')==='password')relative='login.html';
  if(!signed){
   if(relative==='index.html'||relative==='login.html')relative='login.html';
   else if(relative==='homework/index.html'){auth.redirect(res,'/?next='+encodeURIComponent(safePath(req.url)));return;}
   else if(!publicAssets.has(relative)){res.writeHead(401,{'Content-Type':'application/json'}).end('{"error":"请先登录"}');return;}
  }else if(relative==='login.html'&&u.searchParams.get('account')!=='password'){auth.redirect(res,'/');return;}
  const file=resolve(root,relative),type=types[extname(file)];
  if(!file.startsWith(root+sep)||!type||!(pages.has(relative)||relative.startsWith('assets/'))){res.writeHead(404).end();return;}
  const info=await stat(file);if(!info.isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',type);res.setHeader('Vary','Cookie, Accept-Encoding');
  if(publicAssets.has(relative))res.setHeader('Cache-Control','public, max-age=86400');
  if(/\.(html|css|m?js|svg)$/.test(file)&&info.size>512&&/\bgzip\b/.test(req.headers['accept-encoding']||'')){
   let cached=compressed.get(file);if(!cached||cached.mtime!==info.mtimeMs){cached={mtime:info.mtimeMs,bytes:gzipSync(await readFile(file))};compressed.set(file,cached);}
   res.setHeader('Content-Encoding','gzip');res.setHeader('Content-Length',cached.bytes.length);res.writeHead(200).end(req.method==='HEAD'?undefined:cached.bytes);return;
  }
  res.setHeader('Content-Length',info.size);res.writeHead(200);if(req.method==='HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch(e){if(!res.headersSent)res.writeHead(e.code==='ENOENT'?404:e instanceof URIError?400:503,{'Content-Type':'text/plain; charset=utf-8'}).end('暂时无法打开，请稍后重试。');else res.destroy();}
});
server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('Unified economics portal ready'));
process.on('SIGTERM',()=>server.close(async()=>{await auth.close();process.exit(0);}));

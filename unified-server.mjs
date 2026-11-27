import http from 'node:http';
import {deskPage} from './assets/notebook/desk-context.js';
import {bookselfTarget} from './homework-server/review-links.mjs';
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
const pages=new Set(['desk.html','desk-login.html','index.html','login.html','login.css','login.js','portal-nav.js','apps.js','hub.js','hub.css','premium.css','mobile.css','courses.css','floating.css','motion.js','artwork.css','homework/index.html','homework/app.js','homework/ui-labels.js','homework/route-data.js','homework/ui-tokens.css','homework/study-workflow.js','homework/study-workflow.css','homework/workspace-colors.css','homework/grade-journey.js','homework/grade-heatmap.js','homework/grade-journey-model.js','homework/grade-journey.css','homework/score-bands.js','homework/score-entry.js','homework/course-scope.js','homework/view-memory.js','homework/correction-workspace.js','homework/flow.css','homework/form-feedback.js','homework/form-feedback.css','homework/workspace-ui.js','homework/workspace.css','homework/style.css','homework/nav.js','homework/learning-model.js','homework/learning-ui.js','homework/mistake-desk.js','homework/mistake-desk.css','homework/correction-books.js','homework/learning-overview.js','homework/learning-overview.css','homework/learning-analytics-model.js','homework/search-text.js','homework/student-home.js','homework/student-home-model.js','homework/library-page-map.js','homework/assignment-roster.js','homework/question-marker.js','homework/question-view.js','homework/question-slices.js','homework/paper-download.js','homework/result-badge.js','homework/offline-answers.js','homework/topic-grid.js','homework/pdf-reader.js','homework/review-studio.js','homework/review-gallery.js','homework/review-save.js','homework/review-studio.css','homework/self-practice.js','homework/self-practice.css']);
for(const file of ['index.html','app.js','startup.js','question-bank.js','crop-geometry.js','crop-editor.js','style.css','workspace.css','task-layout.css','homework.css','graphs.js','graph-projections.js'])pages.add('teacher/'+file);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.wasm':'application/wasm','.bcmap':'application/octet-stream','.pfb':'application/octet-stream'};
const publicAssets=new Set(['assets/notebook/paper-index.css','assets/notebook/paper-index.svg','assets/notebook/desk-context.js','assets/notebook/journal-layout.js','assets/notebook/desk-hand.woff2','assets/notebook/desk-grain.svg','assets/notebook/cover-cloth.svg','assets/notebook/folio-paper.svg','assets/notebook/login-ticket.svg','assets/notebook/desk-v1.css','assets/notebook/cover-v1.css','assets/notebook/cover-v1.webp','assets/notebook/paper.webp','assets/notebook/leather.webp','assets/notebook/desk-still-wide.webp','assets/notebook/desk-still-portrait.webp','assets/notebook/walnut.webp','assets/notebook/scene-v1.js','assets/notebook/prewarm-v1.js','homework/workspace-colors.css','assets/workspace-art/student-study.webp','assets/workspace-art/teacher-studio.webp','login.css','login.js','assets/mike-hub-mark.svg','assets/hub-serif-84bab7c8.woff2','assets/micro-v1-640-1ed9d14e.webp','assets/macro-v1-640-dba44291.webp','assets/maths-v1-640-f58ee996.webp','assets/scene-mobile-1db46873.webp','assets/econ-quest-logo-816e8870.webp','assets/teachers-34cadd1a.webp']);
for(const f of ['homework/study-workflow.js','homework/study-workflow.css','homework/mock-student-detail.js','homework/library-ui.js','homework/demand-lab.js','homework/library-grading.js','homework/lesson-panel.js','homework/lesson-reference.js','homework/lesson-examples.js','homework/lesson-review.css','homework/mistake-navigation.js','homework/library-packs.js','homework/disclosure-menu.js','homework/assignment-navigation.js','homework/assignment-audience.js','homework/audience-picker.js','homework/library-navigation.js','homework/library-reader.js','homework/library.css','homework/ink.js','companion.js','companion.css','homework/task-flow.css','homework/import-review-model.js','homework/review-links.js','homework/choice-correction.js','homework/frq-parts.js','homework/student-actions.js','homework/attempt-sync.js','homework/mcq-session.js','homework/mcq.js','homework/reading-positions.js','homework/mcq-import.js','homework/mcq.css'])pages.add(f);
for(const f of ['companion.js','companion.css','assets/mike-pixel.png','assets/companion/html2canvas-1.4.1.min.js'])publicAssets.add(f);
for(let stage=0;stage<5;stage++)publicAssets.add('assets/companion/quest-mike-'+stage+'.webp');
for(const file of ['homework/subject-catalog.js','homework/subject-definitions.js','homework/workspace-primitives.css'])pages.add(file);
pages.add('homework/student-report-link.js');
pages.add('teacher/student-report-actions.js');
pages.add('homework/learning-evidence.js');
pages.add('homework/correction-progress.js');
pages.add('homework/learning-evidence.css');
const compressed=new Map();
const deskShell=(await readFile(resolve(root,'desk.html'),'utf8')).match(/<main id="desk"[\s\S]*?<\/main>/)[0];
const notebookEnabled=process.env.NOTEBOOK_HOME_ENABLED!=='0';
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
 try{
  const u=new URL(req.url,'http://local'),path=decodeURIComponent(u.pathname);
  if(path==='/health'){res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true,"mode":"unified-portal"}');return;}
  // This header only selects the canonical URL; authentication never trusts it.
  if(process.env.NODE_ENV==='production'&&['/','/login.html','/homework','/homework/','/teacher','/teacher/'].includes(path)&&req.headers.host!==new URL(auth.portalOrigin).host&&req.headers['x-mike-original-host']!==new URL(auth.portalOrigin).host){auth.redirect(res,auth.portalOrigin+safePath(req.url));return;}
  const outfitRequest=path==='/api/quest/companion-outfit';
  const outfitArt=/^\/quest\/textures\/companion-(?:body-anatomy|teacher-(?:mike|sida|lee)|gear-(?:hats|faces|tops|hands|pants|shoes))\.webp$/.test(path);
  if(req.method==='GET'&&(outfitRequest||outfitArt)){
   if(outfitRequest&&!await auth.session(req)){res.writeHead(401).end();return;}
   const upstream=await fetch(new URL(path,process.env.CORE_INTERNAL_ORIGIN||auth.coreOrigin),{
    headers:outfitRequest?{Cookie:req.headers.cookie||''}:{},redirect:'manual',signal:AbortSignal.timeout(8000)
   });
   res.writeHead(upstream.status,{ 'Content-Type':outfitArt?'image/webp':'application/json',
    'Cache-Control':outfitArt&&upstream.ok?'public, max-age=86400':'private, no-store'});
   res.end(Buffer.from(await upstream.arrayBuffer()));return;
  }
  if(await auth.handle(req,res))return;
  if(await teacherGateway(req,res))return;
  if(await homework(req,res))return;
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  if(path.includes('\\')||path.includes('\0')||path.split('/').some(p=>p.startsWith('.'))){res.writeHead(404).end();return;}
  const demoFiles={'/demo':'index.html','/demo/':'index.html','/demo/demo.css':'demo.css','/demo/demo.js':'demo.js'};
  if(Object.hasOwn(demoFiles,path)){
   // Demo state lives in the current browser tab and uses authored sample data.
   const file=resolve(root,'demo',demoFiles[path]),bytes=await readFile(file);
   res.writeHead(200,{'Content-Type':types[extname(file)],'Content-Length':bytes.length,
    'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'"});
   res.end(req.method==='HEAD'?undefined:bytes);return;
  }
  const signed=await auth.session(req);
  if(signed?.role==='student' && signed.must_change_password && ['/', '/login.html', '/desk.html', '/desk-login.html', '/homework', '/homework/', '/homework/index.html', '/enter/bookself', '/enter/econquest'].includes(path) && !(path==='/' && u.searchParams.get('account')==='password')){
    auth.redirect(res,'/?account=password');return;
  }
  if(path==='/teacher'||path.startsWith('/teacher/')){
   if(process.env.TEACHER_WORKSPACE_ENABLED!=='1'){res.writeHead(404).end();return;}
   if(!signed){auth.redirect(res,'/?next='+encodeURIComponent(safePath(req.url)));return;}
   if(signed.role!=='teacher'){res.writeHead(403,{'Content-Type':'text/html; charset=utf-8'}).end('<!doctype html><html lang="zh-CN"><title>教师工作台</title><meta name="viewport" content="width=device-width"><body><h1>此页面仅供教师使用</h1><p>你的作业与学习记录仍保存在原入口。</p><a href="/">返回经济一页通</a></body></html>');return;}
  }
  if(path==='/enter/bookself'||path==='/enter/econquest'){const target=new URL('/sso/start',auth.coreOrigin);const chapter=u.searchParams.get('chapter'),book=u.searchParams.get('book');const next=chapter||book?bookselfTarget(book,chapter):'/';if(path.endsWith('bookself')&&!next){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('未找到该复习章节，请返回错题集。');return;}target.searchParams.set('next',path.endsWith('econquest')?'/quest/':next);auth.redirect(res,target.href);return;}
  const notebook=notebookEnabled&&u.searchParams.get('view')!=='list';
  let relative=path==='/'||path==='/desk.html'?(notebook?'desk.html':'index.html'):path==='/homework'||path==='/homework/'?'homework/index.html':path.slice(1);
  if(path==='/teacher'||path==='/teacher/')relative='teacher/index.html';
  if(signed&&path==='/'&&u.searchParams.get('account')==='password')relative='login.html';
  if(!signed){
   if(['index.html','desk.html','login.html','desk-login.html'].includes(relative))relative=notebook?'desk-login.html':'login.html';
   else if(relative==='homework/index.html'){auth.redirect(res,'/?next='+encodeURIComponent(safePath(req.url)));return;}
   else if(!publicAssets.has(relative)){res.writeHead(401,{'Content-Type':'application/json'}).end('{"error":"请先登录"}');return;}
  }else if((relative==='login.html'||relative==='desk-login.html')&&u.searchParams.get('account')!=='password'){auth.redirect(res,'/');return;}
  const file=resolve(root,relative),type=types[extname(file)];
  if(!file.startsWith(root+sep)||!type||!(pages.has(relative)||relative.startsWith('assets/'))){res.writeHead(404).end();return;}
  const info=await stat(file);if(!info.isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',type);res.setHeader('Vary','Cookie, Accept-Encoding');
  if(/^assets\/notebook\/(desk-v1\.css|bootstrap-v1\.js)$/.test(relative))res.setHeader('Cache-Control','private, max-age=86400');
  if(relative.startsWith('assets/notebook/')&&publicAssets.has(relative))res.setHeader('Vary','Accept-Encoding');
  if(publicAssets.has(relative))res.setHeader('Cache-Control',/^companion\.(js|css)$/.test(relative)?'public, no-cache':'public, max-age=86400');
  if(relative==='desk-login.html'){
   const bytes=Buffer.from((await readFile(file,'utf8')).replace('<!--notebook-stage-->',()=>deskShell));
   res.setHeader('Content-Length',bytes.length);res.writeHead(200);res.end(req.method==='HEAD'?undefined:bytes);return;
  }
  const teacherDesk=relative==='desk.html'&&signed?.role==='teacher'&&process.env.TEACHER_WORKSPACE_ENABLED==='1';
  const returning=relative==='desk.html'&&deskPage(u.searchParams)!==null;
  if(teacherDesk||returning){
   let html=await readFile(file,'utf8');
   if(teacherDesk)html=html.replace('data-primary="homework"','data-primary="teacher"')
    .replace('<a data-entry="homework-submit" href="/homework/">电子作业工作台','<a data-entry="teacher-workspace" href="/teacher/">教师工作台');
   if(returning)html=html.replace(/<link data-cover-preload [^>]+>\n?/g,'').replace('<body data-primary','<body data-desk-return data-primary');
   const bytes=Buffer.from(html);
   res.setHeader('Content-Length',bytes.length);res.writeHead(200);res.end(req.method==='HEAD'?undefined:bytes);return;
  }
  if(/\.(html|css|m?js|svg)$/.test(file)&&info.size>512&&/\bgzip\b/.test(req.headers['accept-encoding']||'')){
   let cached=compressed.get(file);if(!cached||cached.mtime!==info.mtimeMs){cached={mtime:info.mtimeMs,bytes:gzipSync(await readFile(file))};compressed.set(file,cached);}
   res.setHeader('Content-Encoding','gzip');res.setHeader('Content-Length',cached.bytes.length);res.writeHead(200).end(req.method==='HEAD'?undefined:cached.bytes);return;
  }
  res.setHeader('Content-Length',info.size);res.writeHead(200);if(req.method==='HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch(e){if(!res.headersSent)res.writeHead(e.code==='ENOENT'?404:e instanceof URIError?400:503,{'Content-Type':'text/plain; charset=utf-8'}).end('暂时无法打开，请稍后重试。');else res.destroy();}
});
server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('Unified economics portal ready'));
process.on('SIGTERM',()=>server.close(async()=>{await auth.close();process.exit(0);}));

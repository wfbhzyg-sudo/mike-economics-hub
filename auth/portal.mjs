import pg from 'pg';
import {sharedAuth,safePath} from './shared.mjs';
import {readBody} from '../homework-server/files.mjs';
export async function createPortalAuth(env=process.env){
 const pool=new pg.Pool({connectionString:env.IDENTITY_DATABASE_URL,max:6,connectionTimeoutMillis:10000});
 const auth=sharedAuth({pool,env});await auth.init();
 const json=(res,value,status=200)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(value));
 async function handle(req,res){
  if(await auth.handle(req,res,'portal'))return true;
  const url=new URL(req.url,auth.portalOrigin);if(!url.pathname.startsWith('/api/portal/'))return false;
  try{
   const route=url.pathname.slice('/api/portal/'.length);auth.checkOrigin(req,auth.portalOrigin);
   if(route==='session'&&req.method==='GET'){json(res,{user:auth.publicUser(await auth.session(req)),csrf:auth.csrf(req),coreOrigin:auth.coreOrigin});return true;}
   if(['login','register','recover','password'].includes(route)&&req.method==='POST'){
    const bytes=await readBody(req,6000);let b;try{b=JSON.parse(bytes);}catch{throw Object.assign(Error('请输入有效内容'),{status:400});}
    if(route==='password'&&(!await auth.session(req)||req.headers['x-csrf-token']!==auth.csrf(req)))throw Object.assign(Error('请重新登录后再试'),{status:403});
    const endpoint=route==='password'?'/api/account/password':'/api/auth/'+route;
    const response=await fetch(new URL(endpoint,env.CORE_INTERNAL_ORIGIN||auth.coreOrigin),{method:'POST',headers:{'Content-Type':'application/json','Host':new URL(auth.coreOrigin).host,'Origin':auth.coreOrigin,'Cookie':req.headers.cookie||'','X-Real-IP':String(req.headers['x-real-ip']||req.socket.remoteAddress)},body:bytes,redirect:'manual',signal:AbortSignal.timeout(20000)});
    const result=await response.json();
    if(response.ok){const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies.map(c=>{c=c.replace(/SameSite=Strict/ig,'SameSite=Lax');return b.remember===true?c:c.replace(/; Max-Age=[1-9]\d*/i,'');}));}
    json(res,result,response.status);return true;
   }
   if(route==='logout'&&req.method==='POST'){
    if(req.headers['x-csrf-token']!==auth.csrf(req))throw Object.assign(Error('登录已更新，请刷新页面'),{status:403});
    await auth.revoke(auth.token(req));res.setHeader('Set-Cookie',auth.cookie(auth.cookieName,'',0));json(res,{ok:true});return true;
   }
   json(res,{error:'没有这个接口'},404);
  }catch(e){json(res,{error:e.status?e.message:'账号服务暂时不可用，请稍后重试'},e.status||503);}return true;
 }
 return {...auth,handle,close:()=>pool.end()};
}

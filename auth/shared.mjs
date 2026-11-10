import {randomBytes,createHash,createHmac,timingSafeEqual} from 'node:crypto';
export const digest=s=>createHash('sha256').update(s).digest('hex');
const random=()=>randomBytes(32).toString('base64url');
const pkce=s=>createHash('sha256').update(s).digest('base64url');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function safePath(value,fallback='/') {
 if(typeof value!=='string'||value.length>2000||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n\0]/.test(value))return fallback;
 try{const u=new URL(value,'https://local.invalid');if(u.origin!=='https://local.invalid'||u.pathname.startsWith('/sso/')||u.pathname.startsWith('/api/'))return fallback;return u.pathname+u.search+u.hash;}catch{return fallback;}
}
export function sharedAuth({pool,env=process.env}) {
 const production=env.NODE_ENV==='production',cookieName=production?'__Host-econquest':'econquest_session';
 const portalOrigin=new URL(env.PORTAL_ORIGIN).origin,coreOrigin=new URL(env.CORE_PUBLIC_ORIGIN).origin;
 const signingKey=env.SSO_SIGNING_KEY;if(!signingKey||signingKey.length<43)throw Error('SSO signing key is required');
 const cookie=(name,value,age,sameSite='Lax')=>`${name}=${value}; Path=/; HttpOnly; SameSite=${sameSite}${age===null?'':`; Max-Age=${age}`}${production?'; Secure':''}`;
 const rawCookie=(req,name)=>String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
 const token=req=>{const t=rawCookie(req,cookieName);return /^[\w-]{43}$/.test(t)?t:'';};
 const stamp=s=>createHmac('sha256',signingKey).update(s).digest('base64url');
 const seal=o=>{const s=Buffer.from(JSON.stringify(o)).toString('base64url');return s+'.'+stamp(s);};
 const open=s=>{const [a,b]=s.split('.');if(!a||!equal(stamp(a),b))return null;try{return JSON.parse(Buffer.from(a,'base64url'));}catch{return null;}};
 async function init(){await pool.query(`CREATE SCHEMA IF NOT EXISTS portal_sso;
 CREATE TABLE IF NOT EXISTS portal_sso.families(token_hash text PRIMARY KEY,family_id text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
 CREATE INDEX IF NOT EXISTS portal_sso_family ON portal_sso.families(family_id);
 CREATE TABLE IF NOT EXISTS portal_sso.codes(code_hash text PRIMARY KEY,session_hash text NOT NULL,challenge text NOT NULL,client text NOT NULL,expires_at timestamptz NOT NULL);
 CREATE INDEX IF NOT EXISTS portal_sso_expiry ON portal_sso.codes(expires_at);`);}
 async function session(req,client=pool){const raw=token(req);if(!raw)return null;return (await client.query(`SELECT u.id,u.username,u.name,u.role,u.class_id,u.teacher_id,s.expires_at,s.token_hash FROM econquest.sessions s JOIN econquest.users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()`,[digest(raw)])).rows[0]||null;}
 const publicUser=u=>u?{id:u.id,username:u.username,name:u.name,role:u.role}:null;
 async function revoke(raw){if(!raw)return;const c=await pool.connect();try{await c.query('BEGIN');const h=digest(raw);const owner=(await c.query('SELECT s.user_id FROM econquest.sessions s WHERE s.token_hash=$1 OR s.token_hash IN (SELECT f.token_hash FROM portal_sso.families f WHERE f.family_id=(SELECT family_id FROM portal_sso.families WHERE token_hash=$1)) LIMIT 1',[h])).rows[0];if(owner)await c.query('SELECT id FROM econquest.users WHERE id=$1 FOR UPDATE',[owner.user_id]);const f=(await c.query('SELECT family_id FROM portal_sso.families WHERE token_hash=$1',[h])).rows[0]?.family_id||h;await c.query('DELETE FROM econquest.sessions WHERE token_hash=$1 OR token_hash IN (SELECT token_hash FROM portal_sso.families WHERE family_id=$2)',[h,f]);await c.query('DELETE FROM portal_sso.codes WHERE session_hash=$1 OR session_hash IN (SELECT token_hash FROM portal_sso.families WHERE family_id=$2)',[h,f]);await c.query('DELETE FROM portal_sso.families WHERE family_id=$1',[f]);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
 function checkOrigin(req,origin){if(req.headers['sec-fetch-site']==='cross-site')throw fail(403,'请从本站操作');if(req.headers.origin&&req.headers.origin!==origin)throw fail(403,'请求来源不匹配');}
 function redirect(res,to){res.writeHead(303,{'Location':to,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});res.end();}
 function start(req,res,client='core'){
  const u=new URL(req.url,'http://local'),next=safePath(u.searchParams.get('next'),client==='portal'?'/':'/');
  const state=random(),verifier=random(),name=(production?'__Host-':'')+'mike-flow-'+state.slice(0,12);
  res.setHeader('Set-Cookie',cookie(name,seal({state,verifier,next,client,at:Date.now()}),300));
  const destination=new URL('/sso/authorize',portalOrigin);destination.search=new URLSearchParams({client,state,code_challenge:pkce(verifier)}).toString();redirect(res,destination.href);
 }
 async function authorize(req,res){
  const u=new URL(req.url,portalOrigin),client=u.searchParams.get('client'),state=u.searchParams.get('state'),challenge=u.searchParams.get('code_challenge');
  if(client!=='core'||!/^[\w-]{43}$/.test(state||'')||!/^[\w-]{43}$/.test(challenge||''))throw fail(400,'登录链接无效，请从一页通重新进入');
  const signed=await session(req);if(!signed){redirect(res,'/?authorize='+encodeURIComponent(u.pathname+u.search));return;}
  const code=random();await pool.query(`INSERT INTO portal_sso.codes(code_hash,session_hash,challenge,client,expires_at) VALUES($1,$2,$3,$4,now()+interval '60 seconds')`,[digest(code),signed.token_hash,challenge,client]);
  const to=new URL('/sso/callback',coreOrigin);to.search=new URLSearchParams({code,state,iss:portalOrigin}).toString();redirect(res,to.href);
 }
 async function callback(req,res){
  const u=new URL(req.url,coreOrigin),state=u.searchParams.get('state'),code=u.searchParams.get('code');
  if(!/^[\w-]{43}$/.test(state||'')||!/^[\w-]{43}$/.test(code||'')||u.searchParams.get('iss')!==portalOrigin)throw fail(400,'登录链接无效或已过期');
  const name=(production?'__Host-':'')+'mike-flow-'+state.slice(0,12),flow=open(rawCookie(req,name));
  if(!flow||!equal(flow.state,state)||flow.client!=='core'||Date.now()-flow.at>300000||flow.at>Date.now()+1000)throw fail(400,'登录验证已过期，请重新进入');
  const c=await pool.connect();let raw,expires;
  try{
   await c.query('BEGIN');
   const grant=(await c.query(`DELETE FROM portal_sso.codes WHERE code_hash=$1 AND challenge=$2 AND client='core' AND expires_at>now() RETURNING session_hash`,[digest(code),pkce(flow.verifier)])).rows[0];if(!grant)throw fail(400,'登录链接已使用或已过期');
   // Lock the user before checking the parent session, matching password reset's lock order.
   const owner=(await c.query('SELECT user_id FROM econquest.sessions WHERE token_hash=$1',[grant.session_hash])).rows[0];if(!owner)throw fail(401,'登录已失效');
   await c.query('SELECT id FROM econquest.users WHERE id=$1 FOR UPDATE',[owner.user_id]);
   const parent=(await c.query('SELECT user_id,expires_at FROM econquest.sessions WHERE token_hash=$1 AND expires_at>now()',[grant.session_hash])).rows[0];if(!parent)throw fail(401,'登录已失效');
   const family=(await c.query('SELECT family_id FROM portal_sso.families WHERE token_hash=$1',[grant.session_hash])).rows[0]?.family_id||grant.session_hash;
   await c.query('INSERT INTO portal_sso.families(token_hash,family_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[grant.session_hash,family]);
   raw=random();expires=parent.expires_at;await c.query('INSERT INTO econquest.sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)',[digest(raw),parent.user_id,expires]);await c.query('INSERT INTO portal_sso.families(token_hash,family_id) VALUES($1,$2)',[digest(raw),family]);
   const old=token(req);if(old&&digest(old)!==grant.session_hash)await c.query('DELETE FROM econquest.sessions WHERE token_hash=$1',[digest(old)]);
   await c.query('COMMIT');
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
  res.setHeader('Set-Cookie',[cookie(cookieName,raw,null),cookie(name,'',0)]);redirect(res,safePath(flow.next));
 }
 async function handle(req,res,mode){
  const p=new URL(req.url,'http://local').pathname;if(!p.startsWith('/sso/'))return false;
  try{if(req.method!=='GET')throw fail(405,'不支持的请求方式');
  if(mode==='core'&&p==='/sso/session-guard.js'){
   res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(`(()=>{let busy=false,owner;const leave=()=>{document.documentElement.style.visibility='hidden';location.replace('/sso/start?next='+encodeURIComponent(location.pathname+location.search+location.hash));};async function check(){if(busy||document.hidden)return;busy=true;try{const r=await fetch('/api/auth/session',{cache:'no-store',credentials:'same-origin'});if(!r.ok)return;const s=await r.json();if(!s.user||(owner&&owner!==s.user.id)){leave();return;}owner=s.user.id;}catch{}finally{busy=false;}}window.addEventListener('focus',check);window.addEventListener('pageshow',e=>{if(e.persisted){document.documentElement.style.visibility='hidden';location.reload();}else void check();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)void check();});setInterval(check,30000);void check();})();`);return true;
  }if(mode==='core'&&p==='/sso/start')start(req,res);else if(mode==='core'&&p==='/sso/callback')await callback(req,res);else if(mode==='portal'&&p==='/sso/authorize')await authorize(req,res);else throw fail(404,'没有这个登录页面');}
  catch(e){res.writeHead(e.status||503,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});res.end(`<html lang="zh-CN"><meta name="viewport" content="width=device-width"><title>重新登录</title><p>${e.status?e.message:'账号服务暂时不可用，请稍后重试'}</p><a href="${portalOrigin}/">返回经济一页通</a></html>`);}return true;
 }
 return {init,token,session,publicUser,revoke,handle,checkOrigin,redirect,portalOrigin,coreOrigin,cookieName,cookie,csrf:req=>stamp('csrf:'+token(req))};
}

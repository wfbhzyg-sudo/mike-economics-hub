const $=s=>document.querySelector(s),form=$('#login-form'),params=new URLSearchParams(location.search);
let mode='login',csrf='',recovery='',signed=false;
const messages={'Username or password is incorrect.':'用户名或密码不正确。','Username or recovery code is incorrect.':'用户名或恢复码不正确。','Too many sign-in attempts. Try again in 15 minutes.':'尝试次数较多，请 15 分钟后再试。','Use a password with 12–128 characters.':'密码需为 12–128 位。','This username is unavailable. Please choose another.':'这个用户名已被使用，请换一个。'};
function next(){const a=params.get('authorize');if(a?.startsWith('/sso/authorize?')&&!/[\\\r\n]/.test(a)){location.replace(a);return;}const n=params.get('next');location.replace(n?.startsWith('/')&&!n.startsWith('//')&&!/[\\\r\n]/.test(n)&&!n.startsWith('/api/')&&!n.startsWith('/sso/')?n:'/');}
function setMode(value){
 mode=value;$('#form-error').textContent='';form.hidden=false;$('#recovery-result').hidden=true;
 $('#form-title').textContent={login:'登录一页通',register:'加入你的班级',recover:'找回密码',password:'修改密码'}[mode];
 $('#form-description').textContent={login:'使用现有 Bookself 账号',register:'注册后，三个学习平台共用此账号',recover:'使用你的 Bookself 恢复码',password:'修改后，所有设备需要重新登录'}[mode];
 $('#registration-fields').hidden=mode!=='register';$('#recovery-field').hidden=mode!=='recover';$('#current-field').hidden=mode!=='password';$('#username-field').hidden=mode==='password';$('#login-options').hidden=mode!=='login';$('#consent-field').hidden=mode!=='register';$('#register').hidden=mode!=='login';$('#back-login').hidden=mode==='login';
 $('#back-login').textContent=mode==='password'?'返回一页通':'返回登录';
 $('#password-label').textContent=mode==='recover'||mode==='password'?'新密码':'密码';$('#password').autocomplete=mode==='login'?'current-password':'new-password';$('#password').minLength=mode==='login'?1:12;
 $('#submit').textContent={login:'登录并进入',register:'创建账号',recover:'重设密码',password:'更新密码'}[mode];
 for(const input of form.querySelectorAll('input'))input.required=!input.closest('[hidden]')&&['username','password','name','classCode','recoveryCode','currentPassword','consent'].includes(input.name);
}
$('#recover').onclick=()=>setMode('recover');$('#register').onclick=()=>setMode('register');$('#back-login').onclick=()=>mode==='password'?location.replace('/'):setMode('login');
$('#reveal-password').onclick=()=>{const show=$('#password').type==='password';$('#password').type=show?'text':'password';$('#reveal-password').setAttribute('aria-pressed',String(show));$('#reveal-password').setAttribute('aria-label',show?'隐藏密码':'显示密码');};
form.addEventListener('submit',async e=>{
 e.preventDefault();$('#form-error').textContent='';if(!form.reportValidity())return;
 const button=$('#submit'),label=button.textContent;button.disabled=true;button.textContent=mode==='login'?'正在登录…':'正在保存…';
 try{
  const body=Object.fromEntries(new FormData(form));body.remember=body.remember==='on';body.consent=body.consent==='on';
  const r=await fetch('/api/portal/'+mode,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(body),credentials:'same-origin',signal:AbortSignal.timeout(65000)});const data=await r.json();
  if(!r.ok)throw Error(messages[data.error]||data.error||'暂时无法登录，请稍后重试。');
  if(data.recoveryCode){recovery=data.recoveryCode;signed=mode==='register';form.hidden=true;$('#new-recovery-code').textContent=recovery;$('#recovery-result').hidden=false;$('#form-title').textContent=mode==='register'?'账号已创建':'密码已更新';$('#form-description').textContent='先保存恢复码，再继续学习';$('#back-login').hidden=true;$('#register').hidden=true;return;}
  next();
 }catch(e){$('#form-error').textContent=e.name==='TimeoutError'?'连接较慢，请稍后重试。':e.message==='Failed to fetch'?'网络暂时不可用，请检查连接后重试。':e.message;}
 finally{button.disabled=false;button.textContent=label;}
});
$('#save-code').onclick=()=>{const blob=new Blob(['Bookself 恢复码\n'+recovery+'\n请妥善保存，不要与他人分享。'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Bookself-恢复码.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#finish-recovery').onclick=()=>signed?next():location.replace('/');
setMode('login');
try{const r=await fetch('/api/portal/session',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();csrf=data.csrf;if(data.user){if(params.get('account')==='password')setMode('password');else next();}else if(params.get('account')==='password')$('#form-description').textContent='请先登录，再修改密码';}catch{$('#form-error').textContent='账号服务暂时不可用。你可以稍后重试。';}
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
